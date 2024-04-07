const { Category } = require('../models');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parent_id: null }, // Fetch only parent categories
      include: [{
        model: Category,
        as: 'Subcategories',
        attributes: ['id', 'name'],
      }],
      attributes: ['id', 'name'],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).send({ message: "Server error while fetching categories" });
  }
};
