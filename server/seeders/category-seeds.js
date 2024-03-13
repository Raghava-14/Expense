'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const parentNames = [
      "Utilities",
      "Entertainment",
      "Food and Drinks",
      "Home",
      "Transportation",
      "Life",
      "Investments",
      "Personal Care",
      "Hobbies",
      "Education",
      "Savings and Emergency Funds",
      "Donations",
      "Social and Recreation",
      "Subscriptions",
      "Others"
    ];

    const children = {
      "Utilities": ["Cleaning", "Electricity", "Heat/Gas", "Other", "Trash", "TV/Phone/Internet", "Water"],
      "Entertainment": ["Games", "Movies", "Music", "Other", "Sports"],
      "Food and Drinks": ["Groceries", "Liquor", "Other"],
      "Home": ["Furniture", "Household supplies", "Maintenance", "Mortgage", "Other", "Pets", "Rent", "Services"],
      "Transportation": ["Bicycle", "Bus", "Train", "Rental", "Gas/Fuel/Charge", "Other", "Parking", "Plane", "Taxi"],
      "Life": ["Childcare", "Clothing", "Education", "Gifts", "Insurance", "Medical expenses", "Other", "Taxes"],
      "Investments": ["Stocks", "ETFs", "Mutual funds", "Cryptos", "Gold", "Fixed deposit", "Index funds", "Other"],
      "Personal Care": ["Skincare", "Haircut", "Haircare", "Dental care", "Wellness", "Gym", "Spa", "Makeup", "Perfumes", "Other"],
      "Hobbies": ["Art supplies", "Photography", "Knitting/Sewing", "Gardening", "Model building", "Musical instruments", "Other"],
      "Education": ["Books", "Online courses", "Workshops", "Seminars", "Conferences", "Certification exams", "Fee", "Other"],
      "Savings and Emergency Funds": ["Emergency fund", "Vacation fund", "Retirement savings", "Health savings account (HSA)", "Education fund", "Other"],
      "Donations": ["Charitable donations", "Community support", "Environmental conservation", "Animal welfare", "Other"],
      "Social and Recreation": ["Dining out", "Nightlife", "Social clubs", "Outdoor activities", "Travel", "Other"],
      "Subscriptions": ["Magazines/newspapers", "OTTs", "Games", "Professional organizations", "Club memberships", "Other"],
      "Others": ["Others"]
    };

    // Insert parent categories if they don't exist
    for (const name of parentNames) {
      const existingParents = await queryInterface.sequelize.query(
        `SELECT id FROM "Categories" WHERE "name" = ? LIMIT 1;`,
        {
          replacements: [name],
          type: Sequelize.QueryTypes.SELECT
        }
      );
      const existingParent = existingParents.length ? existingParents[0].id : null;
      

      if (!existingParent) {
        await queryInterface.bulkInsert('Categories', [{
          name,
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
      }
    }

    // Fetch inserted parents to get their IDs
    const insertedParents = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Categories" WHERE name IN (:parentNames);`,
      {
        replacements: { parentNames },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    // Prepare children for bulk insert
    let childCategories = [];
    insertedParents.forEach(parent => {
      const childNames = children[parent.name];
      childNames.forEach(childName => {
        childCategories.push({
          name: childName,
          parent_id: parent.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    });

    // Insert children categories
    for (const category of childCategories) {
      const existingChildren = await queryInterface.sequelize.query(
        `SELECT id FROM "Categories" WHERE "name" = ? AND "parent_id" = ? LIMIT 1;`,
        {
          replacements: [category.name, category.parent_id],
          type: Sequelize.QueryTypes.SELECT
        }
      );
      const existingChild = existingChildren.length ? existingChildren[0].id : null;
      

      if (!existingChild) {
        await queryInterface.bulkInsert('Categories', [category]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
