const successResponse = (res, { data = null, statusCode = 200 }) => {
  if (statusCode === 204) return res.status(204).send();
  return res.status(statusCode).json({
    status: "success",
    ...(data != null && { data })
  });
};

// Sin 'Spread Operator', habría que crear un nuevo atributo del objeto que contenga esa parte.

module.exports = successResponse;