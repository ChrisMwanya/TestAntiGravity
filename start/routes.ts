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
const AccountTypesController = () => import('#controllers/account_types_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const ConfigurationController = () => import('#controllers/configuration_controller')
const AuthController = () => import('#controllers/auth_controller')
const ProfileController = () => import('#controllers/profile_controller')

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

    // Account Types
    router.get('/account-types', [AccountTypesController, 'index']).as('account_types.index')
    router.post('/account-types', [AccountTypesController, 'store']).as('account_types.store')
    router
      .delete('/account-types/:id', [AccountTypesController, 'destroy'])
      .as('account_types.destroy')

    // Categories
    router.get('/categories', [CategoriesController, 'index']).as('categories.index')
    router.post('/categories', [CategoriesController, 'store']).as('categories.store')
    router.delete('/categories/:id', [CategoriesController, 'destroy']).as('categories.destroy')

    // Profile
    router.get('/profile', [ProfileController, 'index']).as('profile.index')
    router.post('/profile', [ProfileController, 'update']).as('profile.update')
    router.post('/profile/avatar', [ProfileController, 'uploadAvatar']).as('profile.avatar.upload')
    router
      .delete('/profile/avatar', [ProfileController, 'deleteAvatar'])
      .as('profile.avatar.delete')

    // Configuration
    router.get('/configuration', [ConfigurationController, 'index']).as('configuration.index')
  })
  .use(middleware.auth())
