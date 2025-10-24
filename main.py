# Minimal bot - WebApp Stars Payment Integration
# Install: pip install python-telegram-bot==20.7
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import (
    Application,
    CommandHandler,
    PreCheckoutQueryHandler,
    MessageHandler,
    filters,
    ContextTypes
)

BOT_TOKEN = "8265410692:AAGkx4V3CPymkRxaidj2gI9MvD2wJaiY0Ck"
WEBAPP_URL = "https://visionary-gingersnap-ab5c81.netlify.app/"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command"""
    keyboard = [[InlineKeyboardButton("🎰 Play Lucky Wizard", web_app={"url": WEBAPP_URL})]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "🎰 *Welcome to Lucky Wizard!*\n\n"
        "Play the ultimate slot machine game!\n"
        "✨ Deposit with Telegram Stars in-app\n"
        "🎁 Get 5 Stars per friend referral\n"
        "🏆 Compete on the leaderboard\n\n"
        "Click below to start playing!",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def precheckout_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Approve all pre-checkout queries"""
    query = update.pre_checkout_query
    await query.answer(ok=True)
    
    user_id = query.from_user.id
    stars = query.total_amount
    payment_id = query.invoice_payload
    
    print(f"✅ Pre-checkout approved")
    print(f"   User: {user_id}")
    print(f"   Stars: {stars}")
    print(f"   Payment ID: {payment_id}")

async def successful_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle successful payment - optional confirmation"""
    payment = update.message.successful_payment
    
    user_id = update.effective_user.id
    stars = payment.total_amount
    payment_id = payment.invoice_payload
    
    print(f"💰 Payment completed!")
    print(f"   User: {user_id}")
    print(f"   Stars: {stars}")
    print(f"   Payment ID: {payment_id}")
    
    # Optional: Send confirmation message
    await update.message.reply_text(
        f"✅ *Payment Successful!*\n\n"
        f"⭐ {stars} Stars have been added to your Lucky Wizard balance!\n\n"
        f"The game has been updated automatically. Continue playing! 🎰",
        parse_mode='Markdown'
    )

def main():
    """Start the bot"""
    app = Application.builder().token(BOT_TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(PreCheckoutQueryHandler(precheckout_callback))
    app.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment))
    
    print("=" * 50)
    print("🤖 Lucky Wizard Bot Started!")
    print("=" * 50)
    print("✅ WebApp: Payment in mini app")
    print("✅ Method: Telegram Stars (XTR)")
    print("✅ Pre-checkout: Auto-approved")
    print(f"📱 WebApp URL: {WEBAPP_URL}")
    print("=" * 50)
    
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()