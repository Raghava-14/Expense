const express = require('express'); 
const router = express.Router(); 
const expenseController = require('../controllers/expenseController'); // Adjust the path as necessary 
const verifyToken = require('../middleware/authMiddleware'); 

//Create an expense
router.post('/', verifyToken, expenseController.createExpense); 

//Update an expense
//router.put('/:expenseId', verifyToken, expenseController.updateExpense); 

//Delete an expense
//router.delete('/:expenseId', verifyToken, expenseController.deleteExpense); 

//Get all expenses
//router.get('/', verifyToken, expenseController.getExpenses); 

//Calculate Balances
router.get('/balance', verifyToken, expenseController.getUserBalance);

//Balance between two users
router.get('/balance/:peerUserId', verifyToken, expenseController.viewBalanceWithUser);


 
 

module.exports = router; 
