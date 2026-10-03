const successResponse = (res, { data = null, statusCode = 200 } = {}) => {
    if (statusCode === 204) return res.status(204).send();

    return res.status(statusCode).json({
        status: "success",
        ...(data != null && { data }),
    });
};

module.exports = successResponse;