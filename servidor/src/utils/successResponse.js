const successResponse = (res, { data = null, statusCode = 200, ...rest } = {}) => {
    if (statusCode === 204) return res.status(204).send();

    return res.status(statusCode).json({
        status: "success",
        ...(data != null && { data }),
        ...rest,
    });
};

module.exports = successResponse;