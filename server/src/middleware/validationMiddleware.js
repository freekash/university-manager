const { body, validationResult } = require('express-validator');

const validateDepartment = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Department name is required')
        .isLength({ min: 2 })
        .withMessage('Department name must be at least 2 characters long'),
    body('branchId')
        .isInt({ min: 1 })
        .withMessage('Branch ID must be an integer greater than or equal to 1'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports = {
    validateDepartment,
};
