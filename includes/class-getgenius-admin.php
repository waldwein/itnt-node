<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class GetGenius_Admin {
    private $loader;

    public function __construct(){
        $this->loader = new GetGenius_Loader();
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
        register_setting('getgenius_general', 'getgenius_enable_feature', array(
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
            'show_in_rest'      => true
        ));

        // Add chatbot title setting
        register_setting('getgenius_general', 'getgenius_title', array(
            'type'               => 'string',
            'sanitize_callback'  => 'sanitize_text_field',
            'default'            => 'ChatBot',
            'show_in_rest'       => true
        ));

        // Add greeting message setting
        register_setting('getgenius_general', 'getgenius_greeting_message', array(
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => 'Hallo! Wie kann ich Dir heute helfen?',
            'show_in_rest'      => true
        ));

        // Add webhook URL setting
        register_setting('getgenius_general', 'getgenius_webhook_url', array(
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'           => '',
            'show_in_rest'      => true
        ));

        // Add privacy notice setting
        register_setting('getgenius_general', 'getgenius_privacy_notice', array(
            'type'              => 'string',
            'sanitize_callback' => 'wp_kses_post',
            'default'           => 'Durch die Nutzung unseres Chatbots stimmen Sie der Verarbeitung Ihrer Daten gemäß unserer Datenschutzerklärung zu. Ihre Nachrichten werden verschlüsselt übertragen und nicht dauerhaft gespeichert.',
            'show_in_rest'      => true
        ));

        // Add message limit reached text setting
        register_setting('getgenius_general', 'getgenius_limit_message', array(
            'type'              => 'string',
            'sanitize_callback' => 'wp_kses_post',
            'default'           => 'Du hast das Limit erreicht. Bitte kontaktiere uns unter info@example.com oder ruf uns an!',
            'show_in_rest'      => true
        ));

        // Add message limit setting
        register_setting('getgenius_general', 'getgenius_message_limit', array(
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'default'           => 10,
            'show_in_rest'      => true
        ));

        // Add settings section
        add_settings_section(
            'getgenius_general_section',
            'General Settings',
            [$this, 'settings_section_callback'],
            'getgenius_general'
        );

        // Add settings fields
        add_settings_field(
            'getgenius_enable_feature',
            'ChatBot',
            [$this, 'enable_feature_callback'],
            'getgenius_general',
            'getgenius_general_section',
            ['label_for' => 'getgenius_enable_feature']
        );

        add_settings_field(
            'getgenius_title',
            'ChatBot Title',
            [$this, 'title_callback'],
            'getgenius_general',
            'getgenius_general_section',
            ['label_for' => 'getgenius_title']
        );

        add_settings_field(
            'getgenius_greeting_message',
            'Greeting Message',
            [$this, 'greeting_message_callback'],
            'getgenius_general',
            'getgenius_general_section',
            ['label_for' => 'getgenius_greeting_message']
        );

        add_settings_field(
            'getgenius_privacy_notice',
            'Privacy Notice (DSGVO)',
            [$this, 'privacy_notice_callback'],
            'getgenius_general',
            'getgenius_general_section',
            ['label_for' => 'getgenius_privacy_notice']
        );

        add_settings_field(
            'getgenius_webhook_url',
            'n8n Webhook URL',
            [$this, 'webhook_url_callback'],
            'getgenius_general',
            'getgenius_general_section',
            ['label_for' => 'getgenius_webhook_url']
        );

        add_settings_field(
            'getgenius_message_limit',
            'Message Limit',
            [$this, 'message_limit_callback'],
            'getgenius_general',
            'getgenius_general_section',
            ['label_for' => 'getgenius_message_limit']
        );

        add_settings_field(
            'getgenius_limit_message',
            'Limit Message Text',
            [$this, 'limit_message_callback'],
            'getgenius_general',
            'getgenius_general_section',
            ['label_for' => 'getgenius_limit_message']
        );
    }

    // Add settings section callback
    public function settings_section_callback() {
        echo '<p>Configure your chatbot settings below.</p>';
    }

    // Checkbox field callback
    public function enable_feature_callback() {
        $option = get_option('getgenius_enable_feature', false);
        echo '<input type="checkbox" id="getgenius_enable_feature" name="getgenius_enable_feature" value="1" ' . checked(1, $option, false) . ' />';
        echo '<label for="getgenius_enable_feature">Enable</label>';
    }

    // Title field callback
    public function title_callback() {
        $option = get_option('getgenius_title', 'ChatBot');
        echo '<input type="text" id="getgenius_title" name="getgenius_title" value="' . esc_attr($option) . '" class="regular-text" />';
        echo '<p class="description">Enter the title for your chatbot.</p>';
    }

    // New callback for greeting message
    public function greeting_message_callback() {
        $option = get_option('getgenius_greeting_message', 'Hallo! Wie kann ich Dir heute helfen?');
        echo '<input type="text" id="getgenius_greeting_message" name="getgenius_greeting_message" value="' . esc_attr($option) . '" class="regular-text" />';
        echo '<p class="description">Enter the greeting message.</p>';
    }

    // New callback for privacy notice
    public function privacy_notice_callback() {
        $option = get_option('getgenius_privacy_notice');
        ?>
        <textarea id="getgenius_privacy_notice" name="getgenius_privacy_notice" rows="5" class="large-text"><?php echo esc_textarea($option); ?></textarea>
        <p class="description">Enter the privacy notice text that users must accept before using the chatbot. HTML is allowed.</p>
        <?php
    }

    // New callback for webhook URL
    public function webhook_url_callback() {
        $option = get_option('getgenius_webhook_url', '');
        echo '<input type="url" id="getgenius_webhook_url" name="getgenius_webhook_url" value="' . esc_url($option) . '" class="regular-text" />';
        echo '<p class="description">Enter your n8n webhook URL here.</p>';
    }

    // Limit message field callback
    public function limit_message_callback() {
        $option = get_option('getgenius_limit_message');
        ?>
        <textarea id="getgenius_limit_message" name="getgenius_limit_message" rows="3" class="large-text"><?php echo esc_textarea($option); ?></textarea>
        <p class="description">Text, der angezeigt wird, wenn das Nachrichtenlimit erreicht ist. HTML ist erlaubt. Beispiel: "Du hast das Limit erreicht. Bitte kontaktiere uns unter info@example.com oder ruf uns an!"</p>
        <?php
    }

    // Message limit field callback
    public function message_limit_callback() {
        $option = get_option('getgenius_message_limit', 10);
        echo '<input type="number" min="1" id="getgenius_message_limit" name="getgenius_message_limit" value="' . esc_attr($option) . '" class="small-text" style="width:80px;" />';
        echo '<p class="description">Maximale Anzahl an Nachrichten pro Nutzer und Sitzung.</p>';
    }

    public function add_admin_menu(){
        add_menu_page(
            'Chatbot Settings',
            'GetGenius AI',
            'manage_options',
            'getgenius_settings',
            array($this, 'render_admin_page'),
            'dashicons-format-chat',
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
            settings_errors('getgenius_messages');
            ?>
            <form method="post" action="options.php">
                <?php
                settings_fields('getgenius_general');
                do_settings_sections('getgenius_general');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    public function enqueue_styles(){
        wp_enqueue_style(
            'custom-admin-style',
            GETGENIUS_PLUGIN_URL . 'assets/css/styles.css',
            array()
        );
    }
}
