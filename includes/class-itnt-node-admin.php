<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class ITNT_Node_Admin {
    private $loader;

    public function __construct(){
        $this->loader = new ITNT_Node_Loader();
    }

    public function init() {
        $this->define_admin_hooks();
        $this->loader->run();
    }

    public function define_admin_hooks() {
        $this->loader->add_action('admin_menu', $this, 'add_admin_menu');
        $this->loader->add_action('admin_enqueue_scripts', $this, 'enqueue_styles');
        $this->loader->add_action('admin_init', $this, 'register_settings');
    }

    // Register a settings section and field
    public function register_settings() {
        // Existing chatbot enable/disable setting
        register_setting('itnt_node_general', 'itnt_node_enable_feature', [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'          => true,
            'show_in_rest'     => true,
        ]);

        // Add greeting message setting
        register_setting('itnt_node_general', 'itnt_node_greeting_message', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'          => 'Hallo! Wie kann ich Dir heute helfen?',
            'show_in_rest'     => true,
        ]);

        // Add webhook URL setting
        register_setting('itnt_node_general', 'itnt_node_webhook_url', [
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'          => '',
            'show_in_rest'     => true,
        ]);

        // Add settings section
        add_settings_section(
            'itnt_node_general_section',
            'General Settings',
            [$this, 'settings_section_callback'],
            'itnt_node_general'
        );

        // Add settings fields
        add_settings_field(
            'itnt_node_enable_feature',
            'ChatBot',
            [$this, 'enable_feature_callback'],
            'itnt_node_general',
            'itnt_node_general_section',
            ['label_for' => 'itnt_node_enable_feature']
        );

        add_settings_field(
            'itnt_node_greeting_message',
            'Greeting Message',
            [$this, 'greeting_message_callback'],
            'itnt_node_general',
            'itnt_node_general_section',
            ['label_for' => 'itnt_node_greeting_message']
        );

        add_settings_field(
            'itnt_node_webhook_url',
            'n8n Webhook URL',
            [$this, 'webhook_url_callback'],
            'itnt_node_general',
            'itnt_node_general_section',
            ['label_for' => 'itnt_node_webhook_url']
        );
    }

    // Add settings section callback
    public function settings_section_callback() {
        echo '<p>Configure your chatbot settings below.</p>';
    }

    // Checkbox field callback
    public function enable_feature_callback() {
        $option = get_option('itnt_node_enable_feature', false);
        echo '<input type="checkbox" id="itnt_node_enable_feature" name="itnt_node_enable_feature" value="1" ' . checked(1, $option, false) . ' />';
        echo '<label for="itnt_node_enable_feature">Enable</label>';
    }

    // New callback for greeting message
    public function greeting_message_callback() {
        $option = get_option('itnt_node_greeting_message', 'Hallo! Wie kann ich Dir heute helfen?');
        echo '<input type="text" id="itnt_node_greeting_message" name="itnt_node_greeting_message" value="' . esc_attr($option) . '" class="regular-text" />';
        echo '<p class="description">Enter the greeting message.</p>';
    }

    // New callback for webhook URL
    public function webhook_url_callback() {
        $option = get_option('itnt_node_webhook_url', '');
        echo '<input type="url" id="itnt_node_webhook_url" name="itnt_node_webhook_url" value="' . esc_url($option) . '" class="regular-text" />';
        echo '<p class="description">Enter your n8n webhook URL here.</p>';
    }

    public function add_admin_menu(){
        add_menu_page(
            'ITNT Node Settings',
            'ITNT Node',
            'manage_options',
            'itnt_node_settings',
            array($this, 'render_admin_page'),
            'dashicons-admin-generic',
            100
        );
    }

    function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <?php
            // Show settings errors if any
            settings_errors('itnt_node_messages');
            ?>
            <form method="post" action="options.php">
                <?php
                settings_fields('itnt_node_general');
                do_settings_sections('itnt_node_general');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    public function enqueue_styles(){
        wp_enqueue_style(
            'custom-admin-style',
            ITNT_NODE_PLUGIN_URL . 'assets/css/styles.css',
            array()
        );
    }
}
