export function buildPaginationResponse(data: any[], total: number, offset: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  const currentPage = offset;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return {
    items: data,
    pagination: {
      totalItems: total,
      totalPages,
      currentPage,
      hasNextPage,
      hasPrevPage,
    },
  };
}
