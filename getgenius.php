<?php

/**
 * Plugin Name:       GetGenius AI
 * Description:       Intelligenter Multi-Assistant-Chatbot für WordPress. Verbinde dich per Webhook mit verschiedenen KI-Assistenten und biete deinen Website-Besuchern automatisierte, personalisierte Antworten in Echtzeit.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            GetGenius
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

define('GETGENIUS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GETGENIUS_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once GETGENIUS_PLUGIN_DIR . 'includes/class-getgenius.php';

/**
 * Plugin activation: set up initial settings
 */
function getgenius_activate() {
    // Set default settings
    add_option('getgenius_enable_feature', true);
    add_option('getgenius_title', 'ChatBot');
    add_option('getgenius_greeting_message', 'Hallo! Wie kann ich Dir heute helfen?');
    add_option('getgenius_webhook_url', '');

    // Clear any rewrite rules
    flush_rewrite_rules();
}

/**
 * Plugin deactivation: clean up if needed
 */
function getgenius_deactivate() {
    // If you want to keep settings, remove these lines
    delete_option('getgenius_enable_feature');
    delete_option('getgenius_title');
    delete_option('getgenius_greeting_message');
    delete_option('getgenius_webhook_url');

    // Clear any rewrite rules
    flush_rewrite_rules();
}

/**
 * Plugin initialization
 */
function getgenius_init() {
    $getgenius = GetGenius::get_instance();
    $getgenius->init();
}

// Register activation/deactivation hooks
register_activation_hook(__FILE__, 'getgenius_activate');
register_deactivation_hook(__FILE__, 'getgenius_deactivate');

// Initialize plugin
add_action('plugins_loaded', 'getgenius_init');
