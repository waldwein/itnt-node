<?php

/**
 * Plugin Name:       GetGenius - Chatbot
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

define('ITNT_NODE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ITNT_NODE_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once ITNT_NODE_PLUGIN_DIR . 'includes/class-itnt-node.php';

/**
 * Plugin activation: set up initial settings
 */
function itnt_node_activate() {
    // Set default settings
    add_option('itnt_node_enable_feature', true);
    add_option('itnt_node_title', 'ChatBot');
    add_option('itnt_node_greeting_message', 'Hallo! Wie kann ich Dir heute helfen?');
    add_option('itnt_node_webhook_url', '');

    // Clear any rewrite rules
    flush_rewrite_rules();
}

/**
 * Plugin deactivation: clean up if needed
 */
function itnt_node_deactivate() {
    // If you want to keep settings, remove these lines
    delete_option('itnt_node_enable_feature');
    delete_option('itnt_node_title');
    delete_option('itnt_node_greeting_message');
    delete_option('itnt_node_webhook_url');

    // Clear any rewrite rules
    flush_rewrite_rules();
}

/**
 * Plugin initialization
 */
function itnt_node_init() {
    $itnt_node = ITNT_Node::get_instance();
    $itnt_node->init();
}

// Register activation/deactivation hooks
register_activation_hook(__FILE__, 'itnt_node_activate');
register_deactivation_hook(__FILE__, 'itnt_node_deactivate');

// Initialize plugin
add_action('plugins_loaded', 'itnt_node_init');
