class APIFeatures {
  // query = Product.find()

  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    //this.queryStr.keyword -> if keyword exists ie if we type
    //localhost:4000/api/v1/products?keyword=AirPods
    const keyword = this.queryStr.keyword
      ? {
          // search in name field
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // Removing fields from the query
    const removeFields = ["keyword", "limit", "page", "sortBy"];
    removeFields.forEach((el) => delete queryCopy[el]);

    // { price: { gte: '1', lte: '200' } }
    // gte, lte etc are mongo operators and each mongo operator starts with $ sign eg $lte
    // so we have to add $ sign $lte and $gte. Hence we replace as below

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryStr.sortBy) {
      const sortBy = this.queryStr.sortBy.toLowerCase();
      let sortQuery = {};

      // Sort by ratings (highest to lowest)
      if (sortBy === "ratings") {
        sortQuery = { ratings: -1 };
      }
      // Sort by reviews (highest to lowest)
      else if (sortBy === "reviews") {
        sortQuery = { numOfReviews: -1 };
      }
      // Sort by price (lowest to highest)
      else if (sortBy === "price_asc") {
        sortQuery = { price: 1 };
      }
      // Sort by price (highest to lowest)
      else if (sortBy === "price_desc") {
        sortQuery = { price: -1 };
      }

      this.query = this.query.sort(sortQuery);
    } else {
      // FIX: Default sort by newest first if no sortBy is provided
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  pagination(resPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }
}

module.exports = APIFeatures;