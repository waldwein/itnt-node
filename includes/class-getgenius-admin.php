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

    public function register_settings() {
        // Register settings
        register_setting('getgenius_general', 'getgenius_enable_feature', [
            'type'              => 'boolean',
            'sanitize_callback' => 'rest_sanitize_boolean',
            'default'           => true,
            'show_in_rest'      => true
        ]);
        register_setting('getgenius_general', 'getgenius_title', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => 'ChatBot',
            'show_in_rest'      => true
        ]);
        register_setting('getgenius_general', 'getgenius_greeting_message', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => 'Hello! How can I help you today?',
            'show_in_rest'      => true
        ]);
        register_setting('getgenius_general', 'getgenius_webhook_url', [
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'           => '',
            'show_in_rest'      => true
        ]);
        register_setting('getgenius_general', 'getgenius_privacy_notice', [
            'type'              => 'string',
            'sanitize_callback' => 'wp_kses_post',
            'default'           => 'Durch die Nutzung unseres Chatbots erklären Sie sich mit der Verarbeitung Ihrer Daten gemäß unserer Datenschutzerklärung einverstanden. Ihre Nachrichten werden sicher übertragen und nicht dauerhaft gespeichert.',
            'show_in_rest'      => true
        ]);
        register_setting('getgenius_general', 'getgenius_limit_message', [
            'type'              => 'string',
            'sanitize_callback' => 'wp_kses_post',
            'default'           => 'Sie haben das Nachrichtenlimit erreicht. Bitte kontaktieren Sie uns unter info@example.com oder rufen Sie uns an!',
            'show_in_rest'      => true
        ]);
        register_setting('getgenius_general', 'getgenius_message_limit', [
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'default'           => 10,
            'show_in_rest'      => true
        ]);
        register_setting(
            'getgenius_general',
            'getgenius_message_limit_global',
            [
                'type' => 'integer',
                'sanitize_callback' => function($input) {
                    $session_limit = intval(get_option('getgenius_message_limit', 10));
                    $input = intval($input);
                    if ($input < $session_limit) {
                        return $session_limit;
                    }
                    return $input;
                },
                'default' => 1000,
                'show_in_rest' => true,
            ]
        );

        // Add settings section
        add_settings_section(
            'getgenius_general_section',
            '',
            [$this, 'settings_section_callback'],
            'getgenius_general'
        );

        // Add settings fields
        add_settings_field(
            'getgenius_enable_feature',
            'Enable ChatBot',
            [$this, 'enable_feature_callback'],
            'getgenius_general',
            'getgenius_general_section'
        );
        add_settings_field(
            'getgenius_title',
            'ChatBot Title',
            [$this, 'title_callback'],
            'getgenius_general',
            'getgenius_general_section'
        );
        add_settings_field(
            'getgenius_greeting_message',
            'Greeting Message',
            [$this, 'greeting_message_callback'],
            'getgenius_general',
            'getgenius_general_section'
        );
        add_settings_field(
            'getgenius_privacy_notice',
            'Privacy Notice (DSGVO)',
            [$this, 'privacy_notice_callback'],
            'getgenius_general',
            'getgenius_general_section'
        );
        add_settings_field(
            'getgenius_webhook_url',
            'n8n Webhook URL',
            [$this, 'webhook_url_callback'],
            'getgenius_general',
            'getgenius_general_section'
        );
        add_settings_field(
            'getgenius_message_limit',
            'Message Limit (per session)',
            [$this, 'message_limit_callback'],
            'getgenius_general',
            'getgenius_general_section'
        );
        add_settings_field(
            'getgenius_message_limit_global',
            'Message Limit (global per day)',
            [$this, 'message_limit_global_callback'],
            'getgenius_general',
            'getgenius_general_section'
        );
        add_settings_field(
            'getgenius_limit_message',
            'Limit Message Text',
            [$this, 'limit_message_callback'],
            'getgenius_general',
            'getgenius_general_section'
        );
    }

    public function settings_section_callback() {
        echo '<div style="margin-bottom:24px;"><strong>Configure your chatbot settings below.</strong></div>';
    }

    public function enable_feature_callback() {
        $option = get_option('getgenius_enable_feature', false);
        echo '<label><input type="checkbox" id="getgenius_enable_feature" name="getgenius_enable_feature" value="1" ' . checked(1, $option, false) . ' /> Enable the chatbot on your site</label>';
    }

    public function title_callback() {
        $option = get_option('getgenius_title', 'ChatBot');
        ?>
        <input type="text" id="getgenius_title" name="getgenius_title" value="<?php echo esc_attr($option); ?>" class="regular-text" />
        <p class="description">Displayed as the chatbot window title.</p>
        <?php
    }

    public function greeting_message_callback() {
        $option = get_option('getgenius_greeting_message', 'Hello! How can I help you today?');
        ?>
        <input type="text" id="getgenius_greeting_message" name="getgenius_greeting_message" value="<?php echo esc_attr($option); ?>" class="regular-text" />
        <p class="description">The first message shown to users.</p>
        <?php
    }

    public function privacy_notice_callback() {
        $option = get_option('getgenius_privacy_notice');
        ?>
        <textarea id="getgenius_privacy_notice" name="getgenius_privacy_notice" rows="4" class="large-text"><?php echo esc_textarea($option); ?></textarea>
        <p class="description">Privacy notice text users must accept before using the chatbot. HTML allowed.</p>
        <?php
    }

    public function webhook_url_callback() {
        $option = get_option('getgenius_webhook_url', '');
        echo '<input type="url" id="getgenius_webhook_url" name="getgenius_webhook_url" value="' . esc_url($option) . '" class="regular-text" />';
        echo '<p class="description">Your n8n webhook endpoint URL.</p>';
    }

    public function message_limit_callback() {
        $option = get_option('getgenius_message_limit', 10);
        echo '<input type="number" min="1" id="getgenius_message_limit" name="getgenius_message_limit" value="' . esc_attr($option) . '" class="small-text" style="width:80px;" />';
        echo '<p class="description">Maximum messages per user session.</p>';
    }

    public function message_limit_global_callback() {
        $session_limit = intval(get_option('getgenius_message_limit', 10));
        $global_limit = intval(get_option('getgenius_message_limit_global', max($session_limit, 1000)));
        ?>
        <input type="number"
               id="getgenius_message_limit_global"
               name="getgenius_message_limit_global"
               value="<?php echo esc_attr($global_limit); ?>"
               min="<?php echo esc_attr($session_limit); ?>"
               step="1"
               required
        />
        <p class="description">Maximum messages allowed globally per day (must be at least the session limit).</p>
        <script>
            // Dynamically update the minimum if the session limit changes
            document.addEventListener('DOMContentLoaded', function() {
                var sessionInput = document.getElementById('getgenius_message_limit');
                var globalInput = document.getElementById('getgenius_message_limit_global');
                if (sessionInput && globalInput) {
                    sessionInput.addEventListener('input', function() {
                        globalInput.min = sessionInput.value;
                        if (parseInt(globalInput.value, 10) < parseInt(sessionInput.value, 10)) {
                            globalInput.value = sessionInput.value;
                        }
                    });
                }
            });
        </script>
        <?php
    }

    public function limit_message_callback() {
        $option = get_option('getgenius_limit_message');
        ?>
        <textarea id="getgenius_limit_message" name="getgenius_limit_message" rows="3" class="large-text"><?php echo esc_textarea($option); ?></textarea>
        <p class="description">Message shown when the user or global message limit is reached. HTML allowed.</p>
        <?php
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
        <div class="wrap" style="max-width: 700px;">
            <h1 style="margin-bottom:24px;">Chatbot Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('getgenius_general');
                echo '<h2 style="margin-top:32px;">General</h2><hr>';
                do_settings_sections('getgenius_general');
                submit_button('Save Settings');
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
