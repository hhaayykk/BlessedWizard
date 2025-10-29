from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from telegram.ext import (
    Application,
    CommandHandler,
    PreCheckoutQueryHandler,
    MessageHandler,
    filters,
    ContextTypes
)
import logging
import signal
import sys

# Configure minimal logging
logging.basicConfig(format="%(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = "8417592854:AAHYll3iNtfdBjh9q3q5yiZ3o0OtsTh-tMQ"
WEBAPP_URL = "https://visionary-gingersnap-ab5c81.netlify.app/"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    user_name = update.effective_user.first_name
    
    referrer_id = None
    if context.args and len(context.args) > 0:
        start_param = context.args[0]
        
        if start_param.startswith('ref'):
            referrer_id = start_param[3:]
            
            if not referrer_id.isdigit():
                referrer_id = None
            elif referrer_id == str(user_id):
                referrer_id = None
    
    webapp_url = WEBAPP_URL
    if referrer_id:
        webapp_url = f"{WEBAPP_URL}#tgWebAppStartParam=ref{referrer_id}"
    
    keyboard = [[
        InlineKeyboardButton(
            "🎰 Spin the Wizard Slots!", 
            web_app=WebAppInfo(url=webapp_url)
        )
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if referrer_id:
        message = (
            f"💫 *Welcome, {user_name}!* \n\n"
            "🎁 *Referral Bonus Activated!*\n"
            "You and your friend both earn *+15⭐ Bonus Stars!*\n\n"
            "🎰 Tap below to spin your luck:"
        )
    else:
        message = (
            f"🧙 *Welcome to Blessed Wizard Slots, {user_name}!* \n\n"
            "⭐️ Earn real Telegram Stars by spinning the slots!\n"
            "🔗 Invite friends and win extra rewards!\n\n"
            "👇 Start your lucky journey:"
        )
    
    await update.message.reply_text(
        message,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = (
        "📜 *Blessed Wizard Guide* 💫\n\n"
        "🎰 *How to Play:*\n"
        "• Enter the slot realm\n"
        "• Spin the slots with Stars\n"
        "• Win magical rewards!\n\n"
        "🔗 *Referral Bonus:*\n"
        "• Share your lucky link\n"
        "• Both gain *+15⭐ Bonus Stars!*\n\n"
        "🧙 Support: @BlessedWizardSupport"
    )
    await update.message.reply_text(help_text, parse_mode='Markdown')

async def precheckout_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.pre_checkout_query
    await query.answer(ok=True)

async def successful_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    payment = update.message.successful_payment
    stars = payment.total_amount
    
    await update.message.reply_text(
        f"🎉 *Payment Successful!* 🎉\n\n"
        f"⭐️ *{stars} Stars* added to your balance.\n\n"
        f"🎰 Keep spinning and winning!",
        parse_mode='Markdown'
    )

def main():
    # Log only on start
    logger.info("✅ Bot started successfully.")

    app = Application.builder().token(BOT_TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(PreCheckoutQueryHandler(precheckout_callback))
    app.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment))
    
    # Handle bot stop (Ctrl+C or SIGTERM)
    def handle_exit(sig, frame):
        logger.info("🛑 Bot ended.")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)

    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
