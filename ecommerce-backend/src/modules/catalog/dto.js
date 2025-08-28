// Data transfer objects and validation for catalog module
const { ApiError } = require('../../shared/errors');

// Helper to parse boolean query params
function parseBoolean(value, name) {
  if (value === undefined) return undefined;
  if (value === 'true' || value === '1' || value === true) return true;
  if (value === 'false' || value === '0' || value === false) return false;
  throw new ApiError(`${name} must be boolean`, 400);
}

function parseGetProducts(query) {
  const {
    search,
    theme,
    minPrice,
    maxPrice,
    page,
    limit,
    order,
    slug,
    setNumber,
    minPieces,
    maxPieces,
    ageMin,
    ageMax,
    status,
    visibility,
    isOnSale,
    isNew,
  } = query;
  const result = {};

  if (search !== undefined) result.search = String(search);
  if (theme !== undefined) result.theme = String(theme);
  if (slug !== undefined) result.slug = String(slug);
  if (setNumber !== undefined) result.setNumber = String(setNumber);

  if (minPrice !== undefined) {
    const value = parseFloat(minPrice);
    if (isNaN(value)) throw new ApiError('minPrice must be a number', 400);
    result.minPrice = value;
  }
  if (maxPrice !== undefined) {
    const value = parseFloat(maxPrice);
    if (isNaN(value)) throw new ApiError('maxPrice must be a number', 400);
    result.maxPrice = value;
  }

  if (minPieces !== undefined) {
    const value = parseInt(minPieces, 10);
    if (isNaN(value) || value < 0) throw new ApiError('minPieces must be a non-negative integer', 400);
    result.minPieces = value;
  }
  if (maxPieces !== undefined) {
    const value = parseInt(maxPieces, 10);
    if (isNaN(value) || value < 0) throw new ApiError('maxPieces must be a non-negative integer', 400);
    result.maxPieces = value;
  }

  if (ageMin !== undefined) {
    const value = parseInt(ageMin, 10);
    if (isNaN(value) || value < 0) throw new ApiError('ageMin must be a non-negative integer', 400);
    result.ageMin = value;
  }
  if (ageMax !== undefined) {
    const value = parseInt(ageMax, 10);
    if (isNaN(value) || value < 0) throw new ApiError('ageMax must be a non-negative integer', 400);
    result.ageMax = value;
  }

  if (page !== undefined) {
    const value = parseInt(page, 10);
    if (isNaN(value) || value < 1) throw new ApiError('page must be positive integer', 400);
    result.page = value;
  }
  if (limit !== undefined) {
    const value = parseInt(limit, 10);
    if (isNaN(value) || value < 1) throw new ApiError('limit must be positive integer', 400);
    result.limit = value;
  }

  if (status !== undefined) result.status = String(status);
  if (visibility !== undefined) result.visibility = String(visibility);
  if (order !== undefined) result.order = String(order);

  const onSale = parseBoolean(isOnSale, 'isOnSale');
  if (onSale !== undefined) result.isOnSale = onSale;
  const newFlag = parseBoolean(isNew, 'isNew');
  if (newFlag !== undefined) result.isNew = newFlag;

  return result;
}

function parseCreateProduct(body) {
  const {
    setNumber,
    name,
    slug,
    price,
    stock,
    pieces,
    description,
    releaseYear,
    categories,
    status,
    code,
    currency,
    imageUrl,
    recommendedAgeMin,
    recommendedAgeMax,
    minifigCount,
    weightGrams,
    boxWidthMm,
    boxHeightMm,
    boxDepthMm,
  } = body;
  if (!setNumber) throw new ApiError('setNumber is required', 400);
  if (!name) throw new ApiError('name is required', 400);
  if (!slug) throw new ApiError('slug is required', 400);
  if (!description) throw new ApiError('description is required', 400);
  if (releaseYear === undefined)
    throw new ApiError('releaseYear is required', 400);
  const priceNum = parseFloat(price);
  if (isNaN(priceNum)) throw new ApiError('price must be a number', 400);
  const stockNum = parseInt(stock, 10);
  if (isNaN(stockNum)) throw new ApiError('stock must be an integer', 400);
  if (recommendedAgeMin === undefined)
    throw new ApiError('recommendedAgeMin is required', 400);
  if (recommendedAgeMax === undefined)
    throw new ApiError('recommendedAgeMax is required', 400);
  const ageMinNum = parseInt(recommendedAgeMin, 10);
  const ageMaxNum = parseInt(recommendedAgeMax, 10);
  if (isNaN(ageMinNum) || ageMinNum < 0)
    throw new ApiError('recommendedAgeMin must be a non-negative integer', 400);
  if (isNaN(ageMaxNum) || ageMaxNum < 0)
    throw new ApiError('recommendedAgeMax must be a non-negative integer', 400);
  if (ageMaxNum < ageMinNum)
    throw new ApiError('recommendedAgeMax must be greater or equal to recommendedAgeMin', 400);
  const releaseYearNum = parseInt(releaseYear, 10);
  if (isNaN(releaseYearNum))
    throw new ApiError('releaseYear must be an integer', 400);
  const result = {
    setNumber: String(setNumber),
    name: String(name),
    slug: String(slug),
    description: String(description),
    price: priceNum,
    stock: stockNum,
    recommendedAgeMin: ageMinNum,
    recommendedAgeMax: ageMaxNum,
    releaseYear: releaseYearNum,
    code: String(code || setNumber),
    currency: String(currency || 'USD'),
  };
  if (pieces !== undefined) {
    const piecesNum = parseInt(pieces, 10);
    if (isNaN(piecesNum)) throw new ApiError('pieces must be an integer', 400);
    result.pieceCount = piecesNum;
  }
  if (Array.isArray(categories)) {
    result.categories = categories.map((c) => String(c));
  }
  if (minifigCount !== undefined) {
    const miniNum = parseInt(minifigCount, 10);
    if (isNaN(miniNum) || miniNum < 0)
      throw new ApiError('minifigCount must be a non-negative integer', 400);
    result.minifigCount = miniNum;
  }
  if (weightGrams !== undefined) {
    const weightNum = parseInt(weightGrams, 10);
    if (isNaN(weightNum) || weightNum < 0)
      throw new ApiError('weightGrams must be a non-negative integer', 400);
    result.weightGrams = weightNum;
  }
  if (boxWidthMm !== undefined) {
    const widthNum = parseInt(boxWidthMm, 10);
    if (isNaN(widthNum) || widthNum < 0)
      throw new ApiError('boxWidthMm must be a non-negative integer', 400);
    result.boxWidthMm = widthNum;
  }
  if (boxHeightMm !== undefined) {
    const heightNum = parseInt(boxHeightMm, 10);
    if (isNaN(heightNum) || heightNum < 0)
      throw new ApiError('boxHeightMm must be a non-negative integer', 400);
    result.boxHeightMm = heightNum;
  }
  if (boxDepthMm !== undefined) {
    const depthNum = parseInt(boxDepthMm, 10);
    if (isNaN(depthNum) || depthNum < 0)
      throw new ApiError('boxDepthMm must be a non-negative integer', 400);
    result.boxDepthMm = depthNum;
  }
  if (status !== undefined) result.status = String(status);
  if (imageUrl !== undefined) result.imageUrl = String(imageUrl);
  return result;
}

module.exports = { parseGetProducts, parseCreateProduct };
