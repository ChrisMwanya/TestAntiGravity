import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { unlink } from 'node:fs/promises'
import Account from '#models/account'
import db from '@adonisjs/lucid/services/db'

export default class ProfileController {
  async index({ auth, view }: HttpContext) {
    const user = auth.user!

    // Get user statistics
    const accounts = await Account.query().where('user_id', user.id)
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)

    const transactionCount = await db
      .from('transactions')
      .whereIn(
        'account_id',
        accounts.map((a) => a.id)
      )
      .count('* as total')
      .first()

    return view.render('pages/profile/index', {
      user,
      stats: {
        accountsCount: accounts.length,
        transactionsCount: transactionCount?.total || 0,
        totalBalance,
      },
    })
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const data = request.only(['fullName', 'email'])

    user.merge(data)
    await user.save()

    session.flash('success', 'Profile updated successfully!')
    return response.redirect('/profile')
  }

  async uploadAvatar({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const avatar = request.file('avatar', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif'],
    })

    if (!avatar) {
      session.flash('error', 'Please select an image to upload')
      return response.redirect('/profile')
    }

    if (!avatar.isValid) {
      session.flash('error', avatar.errors[0].message)
      return response.redirect('/profile')
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = app.makePath('public/uploads/avatars', user.avatar)
      try {
        await unlink(oldAvatarPath)
      } catch (error) {
        // Ignore if file doesn't exist
      }
    }

    // Save new avatar
    const fileName = `${cuid()}.${avatar.extname}`
    await avatar.move(app.makePath('public/uploads/avatars'), {
      name: fileName,
    })

    user.avatar = fileName
    await user.save()

    session.flash('success', 'Avatar updated successfully!')
    return response.redirect('/profile')
  }

  async deleteAvatar({ auth, response, session }: HttpContext) {
    const user = auth.user!

    if (user.avatar) {
      const avatarPath = app.makePath('public/uploads/avatars', user.avatar)
      try {
        await unlink(avatarPath)
      } catch (error) {
        // Ignore if file doesn't exist
      }

      user.avatar = null
      await user.save()

      session.flash('success', 'Avatar deleted successfully!')
    }

    return response.redirect('/profile')
  }
}
