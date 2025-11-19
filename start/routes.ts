/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const DashboardController = () => import('#controllers/dashboard_controller')
const TransactionsController = () => import('#controllers/transactions_controller')
const BudgetsController = () => import('#controllers/budgets_controller')
const InvestmentsController = () => import('#controllers/investments_controller')
const AccountsController = () => import('#controllers/accounts_controller')
const AuthController = () => import('#controllers/auth_controller')

// Public routes
router.on('/').render('pages/home')

// Auth routes (public)
router.get('/register', [AuthController, 'showRegister']).as('auth.register.show')
router.post('/register', [AuthController, 'register']).as('auth.register')
router.get('/login', [AuthController, 'showLogin']).as('auth.login.show')
router.post('/login', [AuthController, 'login']).as('auth.login')
router.post('/logout', [AuthController, 'logout']).as('auth.logout')

// Auth routes
router
  .group(() => {
    // Dashboard
    router.get('/dashboard', [DashboardController, 'index']).as('dashboard')

    // Transactions
    router.get('/transactions', [TransactionsController, 'index']).as('transactions.index')
    router.get('/transactions/create', [TransactionsController, 'create']).as('transactions.create')
    router.post('/transactions', [TransactionsController, 'store']).as('transactions.store')
    router.get('/transactions/:id/edit', [TransactionsController, 'edit']).as('transactions.edit')
    router.put('/transactions/:id', [TransactionsController, 'update']).as('transactions.update')
    router
      .delete('/transactions/:id', [TransactionsController, 'destroy'])
      .as('transactions.destroy')

    // Budgets
    router.get('/budgets', [BudgetsController, 'index']).as('budgets.index')
    router.post('/budgets', [BudgetsController, 'store']).as('budgets.store')
    router.delete('/budgets/:id', [BudgetsController, 'destroy']).as('budgets.destroy')

    // Investments
    router.get('/investments', [InvestmentsController, 'index']).as('investments.index')
    router.post('/investments', [InvestmentsController, 'store']).as('investments.store')
    router.put('/investments/:id', [InvestmentsController, 'update']).as('investments.update')
    router.delete('/investments/:id', [InvestmentsController, 'destroy']).as('investments.destroy')

    // Accounts
    router.get('/accounts', [AccountsController, 'index']).as('accounts.index')
    router.post('/accounts', [AccountsController, 'store']).as('accounts.store')
    router.delete('/accounts/:id', [AccountsController, 'destroy']).as('accounts.destroy')
  })
  .use(middleware.auth())
