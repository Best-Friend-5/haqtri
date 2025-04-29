const {
    MarketplaceListings,
    ListingDetails,
    ListingImages,
    Offers,
    Reviews,
    Bookmarks,
    Messages,
    Users,
    Materials,
    MaterialTransactions,
    UserAddresses,
    PaymentMethods,
    WalletTransactions,
    Wallets,
    VerificationDocuments,
    AuditLogs,
    FeatureFlags
  } = require('../models');
  const { Op, Sequelize } = require('sequelize');
  const { createAuditLog } = require('../utils/auditLog');
  
  /**
   * Marketplace Listings CRUD Operations
   */
  
  // Get all listings with filtering and pagination
  const getAllListings = async (req, res) => {
    try {
      const { 
        type, 
        minPrice, 
        maxPrice, 
        location, 
        status, 
        search, 
        page = 1, 
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;
  
      const whereClause = {};
      if (type) whereClause.type = type;
      if (status) whereClause.status = status;
      if (minPrice) whereClause.price = { [Op.gte]: parseFloat(minPrice) };
      if (maxPrice) whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(maxPrice) };
      if (location) whereClause.location = { [Op.like]: `%${location}%` };
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { keywords: { [Op.like]: `%${search}%` } }
        ];
      }
  
      const offset = (page - 1) * limit;
  
      const listings = await MarketplaceListings.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: Users, 
            as: 'seller',
            attributes: ['user_id', 'first_name', 'last_name', 'profile_picture_url', 'average_rating']
          },
          { 
            model: ListingDetails,
            attributes: ['bedrooms', 'bathrooms', 'area', 'materials', 'experience', 'certifications']
          },
          {
            model: ListingImages,
            attributes: ['image_path'],
            limit: 1
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });
  
      res.status(200).json({
        total: listings.count,
        page: parseInt(page),
        totalPages: Math.ceil(listings.count / limit),
        listings: listings.rows
      });
    } catch (error) {
      console.error('Error fetching listings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // Get a single listing by ID
  const getListingById = async (req, res) => {
    try {
      const { listingId } = req.params;
  
      const listing = await MarketplaceListings.findByPk(listingId, {
        include: [
          { 
            model: Users, 
            as: 'seller',
            attributes: ['user_id', 'first_name', 'last_name', 'business_name', 'profile_picture_url', 'average_rating', 'total_completed_transactions', 'phone']
          },
          { 
            model: ListingDetails,
            attributes: ['bedrooms', 'bathrooms', 'area', 'materials', 'experience', 'certifications']
          },
          {
            model: ListingImages,
            attributes: ['image_id', 'image_path']
          },
          {
            model: VerificationDocuments,
            where: { verified: true },
            required: false,
            attributes: ['document_type', 'document_name']
          }
        ]
      });
  
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
  
      // Increment view count (pseudo-code)
      // await listing.increment('view_count');
  
      res.status(200).json(listing);
    } catch (error) {
      console.error('Error fetching listing:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // Create a new listing
  const createListing = async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        type,
        title,
        description,
        price,
        location,
        status,
        keywords,
        material_id,
        // Details
        bedrooms,
        bathrooms,
        area,
        materials,
        experience,
        certifications,
        // Images
        images
      } = req.body;
  
      // Validate required fields
      if (!type || !title || !description || !price || !location) {
        return res.status(400).json({ message: 'Required fields are missing' });
      }
  
      const transaction = await sequelize.transaction();
  
      try {
        // Create the main listing
        const listing = await MarketplaceListings.create({
          user_id: userId,
          type,
          title,
          description,
          price: parseFloat(price),
          location,
          status: status || 'active',
          keywords,
          material_id,
          verified_at: null,
          purchased_at: null,
          buyer_id: null
        }, { transaction });
  
        // Create listing details if provided
        if (type === 'house' || type === 'plot') {
          await ListingDetails.create({
            listing_id: listing.listing_id,
            bedrooms: bedrooms || null,
            bathrooms: bathrooms || null,
            area: area || null,
            materials: materials || null,
            experience: experience || null,
            certifications: certifications || null
          }, { transaction });
        }
  
        // Process images if provided
        if (images && images.length > 0) {
          const imageRecords = images.map(imagePath => ({
            listing_id: listing.listing_id,
            image_path: imagePath
          }));
          await ListingImages.bulkCreate(imageRecords, { transaction });
        }
  
        await transaction.commit();
  
        // Create audit log
        await createAuditLog({
          user_id: userId,
          entity_type: 'listing',
          entity_id: listing.listing_id,
          action: 'create',
          details: `Created new ${type} listing: ${title}`
        });
  
        res.status(201).json({ 
          message: 'Listing created successfully', 
          listing: {
            ...listing.get({ plain: true }),
            details: { bedrooms, bathrooms, area, materials, experience, certifications },
            images
          }
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // Update a listing
  const updateListing = async (req, res) => {
    try {
      const userId = req.user.id;
      const { listingId } = req.params;
      const updateData = req.body;
  
      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
  
      // Check ownership or admin rights
      if (listing.user_id !== userId && !req.user.is_admin) {
        return res.status(403).json({ message: 'Unauthorized to update this listing' });
      }
  
      // Prevent updating certain fields if listing is sold
      if (listing.status === 'sold') {
        return res.status(400).json({ message: 'Cannot update a sold listing' });
      }
  
      // Filter out fields that shouldn't be updated
      const allowedUpdates = [
        'title', 'description', 'price', 'location', 'status', 'keywords', 'material_id',
        'bedrooms', 'bathrooms', 'area', 'materials', 'experience', 'certifications'
      ];
      const updates = Object.keys(updateData).filter(key => allowedUpdates.includes(key));
  
      const transaction = await sequelize.transaction();
  
      try {
        // Update main listing
        const listingUpdates = {};
        updates.forEach(key => {
          if (['title', 'description', 'location', 'status', 'keywords'].includes(key)) {
            listingUpdates[key] = updateData[key];
          } else if (key === 'price') {
            listingUpdates.price = parseFloat(updateData.price);
          } else if (key === 'material_id') {
            listingUpdates.material_id = updateData.material_id;
          }
        });
  
        if (Object.keys(listingUpdates).length > 0) {
          await listing.update(listingUpdates, { transaction });
        }
  
        // Update details if they exist
        if (['bedrooms', 'bathrooms', 'area', 'materials', 'experience', 'certifications'].some(key => updates.includes(key))) {
          const details = await ListingDetails.findOne({ where: { listing_id: listingId } });
          if (details) {
            const detailsUpdates = {};
            updates.forEach(key => {
              if (['bedrooms', 'bathrooms', 'area', 'materials', 'experience', 'certifications'].includes(key)) {
                detailsUpdates[key] = updateData[key];
              }
            });
            await details.update(detailsUpdates, { transaction });
          }
        }
  
        await transaction.commit();
  
        // Create audit log
        await createAuditLog({
          user_id: userId,
          entity_type: 'listing',
          entity_id: listing.listing_id,
          action: 'update',
          details: `Updated listing: ${listing.title}`
        });
  
        res.status(200).json({ message: 'Listing updated successfully', listing });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // Delete a listing
  const deleteListing = async (req, res) => {
    try {
      const userId = req.user.id;
      const { listingId } = req.params;
  
      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
  
      // Check ownership or admin rights
      if (listing.user_id !== userId && !req.user.is_admin) {
        return res.status(403).json({ message: 'Unauthorized to delete this listing' });
      }
  
      // Soft delete (set status to deleted)
      await listing.update({ status: 'deleted' });
  
      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'listing',
        entity_id: listing.listing_id,
        action: 'delete',
        details: `Deleted listing: ${listing.title}`
      });
  
      res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
      console.error('Error deleting listing:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // Add images to a listing
  const addListingImages = async (req, res) => {
    try {
      const userId = req.user.id;
      const { listingId } = req.params;
      const { images } = req.body;
  
      if (!images || images.length === 0) {
        return res.status(400).json({ message: 'No images provided' });
      }
  
      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
  
      if (listing.user_id !== userId && !req.user.is_admin) {
        return res.status(403).json({ message: 'Unauthorized to modify this listing' });
      }
  
      const imageRecords = images.map(imagePath => ({
        listing_id: listingId,
        image_path: imagePath
      }));
  
      const createdImages = await ListingImages.bulkCreate(imageRecords);
  
      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'listing',
        entity_id: listing.listing_id,
        action: 'update',
        details: `Added ${createdImages.length} images to listing`
      });
  
      res.status(201).json({ message: 'Images added successfully', images: createdImages });
    } catch (error) {
      console.error('Error adding listing images:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // Remove an image from a listing
  const removeListingImage = async (req, res) => {
    try {
      const userId = req.user.id;
      const { listingId, imageId } = req.params;
  
      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
  
      if (listing.user_id !== userId && !req.user.is_admin) {
        return res.status(403).json({ message: 'Unauthorized to modify this listing' });
      }
  
      const image = await ListingImages.findOne({
        where: {
          image_id: imageId,
          listing_id: listingId
        }
      });
  
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }
  
      await image.destroy();
  
      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'listing',
        entity_id: listing.listing_id,
        action: 'update',
        details: `Removed image from listing`
      });
  
      res.status(200).json({ message: 'Image removed successfully' });
    } catch (error) {
      console.error('Error removing listing image:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  /**
   * Offers and Transactions
   */
  
  // Create an offer for a listing
  const createOffer = async (req, res) => {
    try {
      const userId = req.user.id;
      const { listingId } = req.params;
      const { offer_amount, message } = req.body;
  
      if (!offer_amount) {
        return res.status(400).json({ message: 'Offer amount is required' });
      }
  
      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
  
      if (listing.user_id === userId) {
        return res.status(400).json({ message: 'Cannot make an offer on your own listing' });
      }
  
      if (listing.status !== 'active') {
        return res.status(400).json({ message: 'Cannot make an offer on a non-active listing' });
      }
  
      const offer = await Offers.create({
        listing_id: listingId,
        buyer_id: userId,
        offer_amount: parseFloat(offer_amount),
        status: 'pending'
      });
  
      // Create a message to the seller
      if (message) {
        await Messages.create({
          sender_id: userId,
          receiver_id: listing.user_id,
          content: `New offer of ${offer_amount} for your listing "${listing.title}". Message: ${message}`,
          status: 'sent'
        });
      }
  
      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'offer',
        entity_id: offer.offer_id,
        action: 'create',
        details: `Created offer for listing ${listingId} with amount ${offer_amount}`
      });
  
      res.status(201).json({ message: 'Offer created successfully', offer });
    } catch (error) {
      console.error('Error creating offer:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // Respond to an offer (accept/reject)
  const respondToOffer = async (req, res) => {
    try {
      const userId = req.user.id;
      const { offerId } = req.params;
      const { action, message } = req.body; // action: 'accept' or 'reject'
  
      if (!['accept', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
      }
  
      const offer = await Offers.findByPk(offerId, {
        include: [
          {
            model: MarketplaceListings,
            as: 'listing',
            attributes: ['listing_id', 'user_id', 'title', 'price', 'type']
          }
        ]
      });
  
      if (!offer) {
        return res.status(404).json({ message: 'Offer not found' });
      }
  
      if (offer.listing.user_id !== userId) {
        return res.status(403).json({ message: 'Unauthorized to respond to this offer' });
      }
  
      if (offer.status !== 'pending') {
        return res.status(400).json({ message: 'Offer has already been responded to' });
      }
  
      const newStatus = action === 'accept' ? 'accepted' : 'rejected';
      await offer.update({
        status: newStatus,
        responded_at: new Date()
      });
  
      // Update listing status if offer was accepted
      if (action === 'accept') {
        await offer.listing.update({
          status: 'pending',
          buyer_id: offer.buyer_id
        });
      }
  
      // Send message to buyer
      await Messages.create({
        sender_id: userId,
        receiver_id: offer.buyer_id,
        content: message || `Your offer of ${offer.offer_amount} for "${offer.listing.title}" has been ${newStatus}`,
        status: 'sent'
      });
  
      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'offer',
        entity_id: offer.offer_id,
        action: 'update',
        details: `${action} offer for listing ${offer.listing.listing_id}`
      });
  
      res.status(200).json({ 
        message: `Offer ${newStatus} successfully`,
        offer,
        listing: action === 'accept' ? offer.listing : undefined
      });
    } catch (error) {
      console.error('Error responding to offer:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // Complete a transaction (after offer acceptance)
  const completeTransaction = async (req, res) => {
    try {
      const userId = req.user.id;
      const { listingId } = req.params;
      const { payment_method_id, shipping_address_id } = req.body;
  
      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
  
      if (listing.user_id !== userId && listing.buyer_id !== userId) {
        return res.status(403).json({ message: 'Unauthorized to complete this transaction' });
      }
  
      if (listing.status !== 'pending') {
        return res.status(400).json({ message: 'Transaction cannot be completed for this listing' });
      }
  
      // Verify payment method belongs to buyer
      if (listing.buyer_id === userId) {
        const paymentMethod = await PaymentMethods.findOne({
          where: {
            payment_method_id,
            user_id: userId
          }
        });
  
        if (!paymentMethod) {
          return res.status(400).json({ message: 'Invalid payment method' });
        }
      }
  
      // Verify shipping address belongs to buyer
      if (listing.type === 'material' && listing.buyer_id === userId) {
        const shippingAddress = await UserAddresses.findOne({
          where: {
            address_id: shipping_address_id,
            user_id: userId
          }
        });
  
        if (!shippingAddress) {
          return res.status(400).json({ message: 'Invalid shipping address' });
        }
      }
  
      const transaction = await sequelize.transaction();
  
      try {
        // Update listing status
        await listing.update({
          status: 'sold',
          purchased_at: new Date()
        }, { transaction });
  
        // Create material transaction record if applicable
        if (listing.type === 'material') {
          await MaterialTransactions.create({
            material_id: listing.material_id,
            buyer_id: listing.buyer_id,
            seller_id: listing.user_id,
            quantity: 1, // Assuming quantity is handled in the listing
            price: listing.price,
            transaction_date: new Date(),
            status: 'completed'
          }, { transaction });
        }
  
        // Process payment (pseudo-code)
        // const paymentResult = await processPayment({
        //   amount: listing.price,
        //   payment_method_id,
        //   buyer_id: listing.buyer_id,
        //   seller_id: listing.user_id
        // });
  
        // Create wallet transactions for both parties (if using wallet system)
        // await WalletTransactions.create([
        //   {
        //     wallet_id: buyerWallet.wallet_id,
        //     amount: -listing.price,
        //     transaction_type: 'payment',
        //     status: 'completed'
        //   },
        //   {
        //     wallet_id: sellerWallet.wallet_id,
        //     amount: listing.price,
        //     transaction_type: 'payment',
        //     status: 'completed'
        //   }
        // ], { transaction });
  
        await transaction.commit();
  
        // Create audit log
        await createAuditLog({
          user_id: userId,
          entity_type: 'listing',
          entity_id: listing.listing_id,
          action: 'update',
          details: `Completed transaction for listing ${listing.title}`
        });
  
        // Notify both parties
        await Messages.bulkCreate([
          {
            sender_id: userId,
            receiver_id: listing.user_id,
            content: `Transaction completed for your listing "${listing.title}"`,
            status: 'sent'
          },
          {
            sender_id: userId,
            receiver_id: listing.buyer_id,
            content: `Transaction completed for listing "${listing.title}"`,
            status: 'sent'
          }
        ]);
  
        res.status(200).json({ message: 'Transaction completed successfully', listing });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error completing transaction:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  /**
   * User Interactions
   */
  
  // Bookmark a listing
  const bookmarkListing = async (req, res) => {
    try {
      const userId = req.user.id;
      const { listingId } = req.params;
  
      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
  
      const existingBookmark = await Bookmarks.findOne({
        where: {
          user_id: userId,
          post_id: listingId
        }
      });
  
      if (existingBookmark) {
        return res.status(400).json({ message: 'Listing already bookmarked' });
      }
  
      await Bookmarks.create({
        user_id: userId,
        post_id: listingId
      });
  
      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'bookmark',
        entity_id: listingId,
        action: 'create',
        details: `Bookmarked listing ${listing.title}`
      });
  
      res.status(201).json({ message: 'Listing bookmarked successfully' });
    } catch (error) {
      console.error('Error bookmarking listing:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // Remove bookmark from a listing
  const removeBookmark = async (req, res) => {
    try {
      const userId = req.user.id;
      const { listingId } = req.params;
  
      const bookmark = await Bookmarks.findOne({
        where: {
          user_id: userId,
          post_id: listingId
        }
      });
  
      if (!bookmark) {
        return res.status(404).json({ message: 'Bookmark not found' });
      }
  
      await bookmark.destroy();
  
      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'bookmark',
        entity_id: listingId,
        action: 'delete',
        details: `Removed bookmark from listing ${listingId}`
      });
  
      res.status(200).json({ message: 'Bookmark removed successfully' });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // Get user's bookmarked listings
  const getUserBookmarks = async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
  
      const bookmarks = await Bookmarks.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: MarketplaceListings,
            as: 'listing',
            include: [
              {
                model: Users,
                as: 'seller',
                attributes: ['user_id', 'first_name', 'last_name', 'profile_picture_url']
              },
              {
                model: ListingImages,
                attributes: ['image_path'],
                limit: 1
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']]
      });
  
      res.status(200).json({
        total: bookmarks.count,
        page: parseInt(page),
        totalPages: Math.ceil(bookmarks.count / limit),
        bookmarks: bookmarks.rows.map(b => b.listing)
      });
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  // Contact seller
  const contactSeller = async (req, res) => {
    try {
      const userId = req.user.id;
      const { listingId } = req.params;
      const { message } = req.body;
  
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }
  
      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
  
      if (listing.user_id === userId) {
        return res.status(400).json({ message: 'Cannot contact yourself' });
      }
  
      await Messages.create({
        sender_id: userId,
        receiver_id: listing.user_id,
        content: `Regarding your listing "${listing.title}": ${message}`,
        status: 'sent'
      });
  
      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'message',
        entity_id: listingId,
                action: 'create',
        details: `Sent message to seller for listing ${listing.title}`
      });

      res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error('Error contacting seller:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Submit a review for a listing or seller
  const submitReview = async (req, res) => {
    try {
      const userId = req.user.id;
      const { listingId } = req.params;
      const { rating, review_text } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Valid rating (1-5) is required' });
      }

      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      // Check if user has completed a transaction for this listing
      const isBuyer = listing.buyer_id === userId && listing.status === 'sold';
      if (!isBuyer) {
        return res.status(403).json({ message: 'Only buyers who completed a purchase can review' });
      }

      // Check if review already exists
      const existingReview = await Reviews.findOne({
        where: {
          reviewer_id: userId,
          entity_type: 'listing',
          entity_id: listingId
        }
      });

      if (existingReview) {
        return res.status(400).json({ message: 'Review already submitted for this listing' });
      }

      const review = await Reviews.create({
        reviewer_id: userId,
        reviewed_id: listing.user_id,
        entity_type: 'listing',
        entity_id: listingId,
        rating,
        review_text
      });

      // Update seller's average rating
      const sellerReviews = await Reviews.findAll({
        where: { reviewed_id: listing.user_id }
      });
      const avgRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
      await Users.update(
        { average_rating: avgRating },
        { where: { user_id: listing.user_id } }
      );

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'review',
        entity_id: review.review_id,
        action: 'create',
        details: `Submitted review for listing ${listing.title}`
      });

      res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get reviews for a listing
  const getListingReviews = async (req, res) => {
    try {
      const { listingId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      const reviews = await Reviews.findAndCountAll({
        where: {
          entity_type: 'listing',
          entity_id: listingId
        },
        include: [
          {
            model: Users,
            as: 'reviewer',
            attributes: ['user_id', 'first_name', 'last_name', 'profile_picture_url']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        total: reviews.count,
        page: parseInt(page),
        totalPages: Math.ceil(reviews.count / limit),
        reviews: reviews.rows
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * Verification and Documents
   */

  // Upload verification documents for a listing
  const uploadVerificationDocument = async (req, res) => {
    try {
      const userId = req.user.id;
      const { listingId } = req.params;
      const { document_type, file_path, document_name } = req.body;

      if (!document_type || !file_path || !document_name) {
        return res.status(400).json({ message: 'Document type, file path, and name are required' });
      }

      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      if (listing.user_id !== userId && !req.user.is_admin) {
        return res.status(403).json({ message: 'Unauthorized to upload documents for this listing' });
      }

      const document = await VerificationDocuments.create({
        user_id: userId,
        listing_id: listingId,
        document_type,
        file_path,
        document_name,
        verified: false
      });

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'verification_document',
        entity_id: document.doc_id,
        action: 'create',
        details: `Uploaded verification document for listing ${listing.title}`
      });

      res.status(201).json({ message: 'Document uploaded successfully', document });
    } catch (error) {
      console.error('Error uploading verification document:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Verify a listing (admin only)
  const verifyListing = async (req, res) => {
    try {
      const userId = req.user.id;
      const { listingId } = req.params;
      const { verification_notes } = req.body;

      if (!req.user.is_admin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      await listing.update({
        verified_at: new Date()
      });

      // Update related verification documents
      await VerificationDocuments.update(
        { 
          verified: true,
          verification_notes 
        },
        { 
          where: { listing_id: listingId } 
        }
      );

      // Create audit log
      await createAuditLog({
        user_id: userId,
        entity_type: 'listing',
        entity_id: listing.listing_id,
        action: 'verify',
        details: `Verified listing ${listing.title}`
      });

      // Notify seller
      await Messages.create({
        sender_id: userId,
        receiver_id: listing.user_id,
        content: `Your listing "${listing.title}" has been verified`,
        status: 'sent'
      });

      res.status(200).json({ message: 'Listing verified successfully', listing });
    } catch (error) {
      console.error('Error verifying listing:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * Payment and Wallet Operations
   */

  // Add funds to wallet
  const addFundsToWallet = async (req, res) => {
    try {
      const userId = req.user.id;
      const { amount, payment_method_id } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Valid amount is required' });
      }

      const paymentMethod = await PaymentMethods.findOne({
        where: {
          payment_method_id,
          user_id: userId
        }
      });

      if (!paymentMethod) {
        return res.status(400).json({ message: 'Invalid payment method' });
      }

      const wallet = await Wallets.findOne({ where: { user_id: userId } });
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }

      const transaction = await sequelize.transaction();

      try {
        // Update wallet balance
        await wallet.update(
          { balance: wallet.balance + parseFloat(amount) },
          { transaction }
        );

        // Create wallet transaction
        await WalletTransactions.create({
          wallet_id: wallet.wallet_id,
          amount: parseFloat(amount),
          transaction_type: 'deposit',
          status: 'completed'
        }, { transaction });

        await transaction.commit();

        // Create audit log
        await createAuditLog({
          user_id: userId,
          entity_type: 'wallet',
          entity_id: wallet.wallet_id,
          action: 'deposit',
          details: `Added ${amount} to wallet`
        });

        res.status(200).json({ message: 'Funds added successfully', wallet });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error adding funds to wallet:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Withdraw funds from wallet
  const withdrawFundsFromWallet = async (req, res) => {
    try {
      const userId = req.user.id;
      const { amount, payment_method_id } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Valid amount is required' });
      }

      const paymentMethod = await PaymentMethods.findOne({
        where: {
          payment_method_id,
          user_id: userId
        }
      });

      if (!paymentMethod) {
        return res.status(400).json({ message: 'Invalid payment method' });
      }

      const wallet = await Wallets.findOne({ where: { user_id: userId } });
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }

      if (wallet.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      const transaction = await sequelize.transaction();

      try {
        // Update wallet balance
        await wallet.update(
          { balance: wallet.balance - parseFloat(amount) },
          { transaction }
        );

        // Create wallet transaction
        await WalletTransactions.create({
          wallet_id: wallet.wallet_id,
          amount: -parseFloat(amount),
          transaction_type: 'withdrawal',
          status: 'completed'
        }, { transaction });

        await transaction.commit();

        // Create audit log
        await createAuditLog({
          user_id: userId,
          entity_type: 'wallet',
          entity_id: wallet.wallet_id,
          action: 'withdrawal',
          details: `Withdrew ${amount} from wallet`
        });

        res.status(200).json({ message: 'Funds withdrawn successfully', wallet });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error withdrawing funds from wallet:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get wallet transaction history
  const getWalletTransactionHistory = async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const wallet = await Wallets.findOne({ where: { user_id: userId } });
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }

      const transactions = await WalletTransactions.findAndCountAll({
        where: { wallet_id: wallet.wallet_id },
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        total: transactions.count,
        page: parseInt(page),
        totalPages: Math.ceil(transactions.count / limit),
        transactions: transactions.rows,
        currentBalance: wallet.balance
      });
    } catch (error) {
      console.error('Error fetching wallet transaction history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * Feature Flags
   */

  // Check if a feature is enabled for a user
  const checkFeatureFlag = async (req, res) => {
    try {
      const userId = req.user.id;
      const { flag_name } = req.params;

      const featureFlag = await FeatureFlags.findOne({
        where: {
          flag_name,
          [Op.or]: [
            { user_id: userId },
            { user_id: null }
          ]
        }
      });

      if (!featureFlag) {
        return res.status(404).json({ message: 'Feature flag not found' });
      }

      res.status(200).json({
        flag_name: featureFlag.flag_name,
        is_enabled: featureFlag.is_enabled
      });
    } catch (error) {
      console.error('Error checking feature flag:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * Material-Specific Operations
   */

  // Get materials for a listing
  const getListingMaterials = async (req, res) => {
    try {
      const { listingId } = req.params;

      const listing = await MarketplaceListings.findByPk(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      if (!listing.material_id) {
        return res.status(400).json({ message: 'This listing is not associated with a material' });
      }

      const material = await Materials.findByPk(listing.material_id, {
        include: [
          {
            model: Vendors,
            attributes: ['vendor_id', 'name', 'ethical_rating']
          }
        ]
      });

      res.status(200).json(material);
    } catch (error) {
      console.error('Error fetching listing materials:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get material transaction history
  const getMaterialTransactionHistory = async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const transactions = await MaterialTransactions.findAndCountAll({
        where: {
          [Op.or]: [
            { buyer_id: userId },
            { seller_id: userId }
          ]
        },
        include: [
          {
            model: Materials,
            attributes: ['name', 'description']
          },
          {
            model: Users,
            as: 'buyer',
            attributes: ['user_id', 'first_name', 'last_name']
          },
          {
            model: Users,
            as: 'seller',
            attributes: ['user_id', 'first_name', 'last_name']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['transaction_date', 'DESC']]
      });

      res.status(200).json({
        total: transactions.count,
        page: parseInt(page),
        totalPages: Math.ceil(transactions.count / limit),
        transactions: transactions.rows
      });
    } catch (error) {
      console.error('Error fetching material transaction history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  /**
   * Export all controller functions
   */
  module.exports = {
    getAllListings,
    getListingById,
    createListing,
    updateListing,
    deleteListing,
    addListingImages,
    removeListingImage,
    createOffer,
    respondToOffer,
    completeTransaction,
    bookmarkListing,
    removeBookmark,
    getUserBookmarks,
    contactSeller,
    submitReview,
    getListingReviews,
    uploadVerificationDocument,
    verifyListing,
    addFundsToWallet,
    withdrawFundsFromWallet,
    getWalletTransactionHistory,
    checkFeatureFlag,
    getListingMaterials,
    getMaterialTransactionHistory
  };