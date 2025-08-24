import { getProducts } from './api';

describe('getProducts', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ items: [], total: 0, limit: 10, page: 1 })),
      })
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('sends query params for filters, pagination and ordering', async () => {
    await getProducts({
      search: 'car',
      theme: 'city',
      minPrice: '10',
      maxPrice: '50',
      featured: true,
      page: 2,
      limit: 5,
      order: 'price_desc',
    });

    const url = global.fetch.mock.calls[0][0];
    const params = new URL(url).searchParams;
    expect(params.get('search')).toBe('car');
    expect(params.get('theme')).toBe('city');
    expect(params.get('minPrice')).toBe('10');
    expect(params.get('maxPrice')).toBe('50');
    expect(params.get('page')).toBe('2');
    expect(params.get('limit')).toBe('5');
    expect(params.get('order')).toBe('price_desc');
    expect(params.get('featured')).toBe('true');
  });
});
