</script><script type="text/javascript" src="//cdn.mxpnl.com/cache/dac683f83b6aa7c4079dd5290d4082c0/bundle/events.min.js"></script><script type="text/javascript">
        mixpanel.init('c35a11af2ee74aa6470ccf48826ad58d', {}, 'trends_tab');
        var events = ["GAME_gameStart", "GAME_play", "GAME_endTurn", "VIRAL_turnrequest_shown", "FB_request_sent", "VIRAL_turnrequest_accept", "UI_SuggestedBuddyList", "VIRAL_turnrequest_frictionless", "VIRAL_user_source", "FB_AutoLogin", "FB_Gifting_InviteSent", "VIRAL_giftsend_send", "FB_BonusRollUsed", "UI_gameOver", "GAME_gameover", "GIFTS_Inbox_Open", "FB_BonusRollCountLte", "FB_turn_wallpost_open", "VIRAL_turnrequest_cancel", "GAME_chat_click", "FB_turn_wallpost_cancel", "UI_rematch", "HELP_tut_newuser_start", "HELP_tut_splash", "GIFTS_Inbox_Close", "GIFTS_Inbox_Resolve_All", "UI_newGameMenu", "HELP_tutorial_skip", "LOGIN_create_error", "UI_newGameInitiated", "LOGIN_create_click", "FB_turn_wallpost_sent", "VIRAL_giftsend_shown", "LOGIN_login_click", "FB_ManualLogin", "LOGIN_show_login", "FB_invite_open", "LOGIN_login_error", "IAP_ClickedBonusRolls", "HELP_tut_hold_roll_again_done", "VIRAL_giftsend_send_all", "UI_newGameInitiated_SuggestedBuddy", "HELP_tut_roll", "HELP_tut_wait_continue_done", "MENU_settings", "HELP_tut_select_combo", "HELP_tut_roll_done", "HELP_tut_select_combo_done", "HELP_tut_play_turn", "LOGIN_create_success", "FB_login", "HELP_tut_play_turn_done", "HELP_tut_wait_continue", "HELP_tut_roll_another", "VIRAL_giftsend_cancel", "HELP_tut_roll_another_done", "HELP_tut_hold_roll_again", "HELP_tut_play_turn_again", "HELP_tut_newgame_shown", "HELP_tut_play_turn_again_done", "LOGIN_login_success", "HELP_tut_newgame_click", "HELP_tutorial_finish", "FB_connected", "GAME_help_click", "GAME_gameover_brag_click", "FB_brag_open", "MENU_settings_sound_off", "FB_brag_sent", "IAP_ClickedSKU", "MENU_settings_sound_on", "IAP_Success", "IAP_Credited", "FB_AppOpen", "IAP_FlashSale", "IAP_ClosedFlashSale", "VIRAL_prestitial_shown"];
        mp.report.globals.events = _.map(events, function(e) {
            return decodeURIComponent(e);
        });

        mp.report.globals.project_owner = 25127;
        // API Request params (charts)
        mp.report.globals.params = {
            unit: 'day',
            from_date: mp.utility.to_localized_date(new Date).addDays(-31).toString('yyyy-MM-dd'), // 31 days ago
            to_date: mp.utility.to_localized_date(new Date).toString('yyyy-MM-dd'),
            event: mp.report.globals.events.slice(0, 12),
            limit: 255,
            type: 'general',
            service: 'events/',
            chart_type: 'line'
        };

        // API Request params (table update)

        mp.report.globals.table_params = {
            unit: 'day',
            endpoint: 'events/',
            interval: 5,
            event: mp.report.globals.events.slice(0, 50),
            type: 'general'
        };

        var initial_location = "#events";

        var update_overview_link = function() {
            if (window.location.hash === initial_location || window.location.hash.length == 0) {
                $('#overview-link-wrapper').hide();
            } else {
                $('#overview-link-wrapper').show();
            }
        };

        // Security - fixes matasano #4 - reflected cross-site scripting in events report
        // used for deep-linking via email
        (function() {
            var qparams = {};
            window.location.search.slice(1).replace(/([^=&]+)=([^&]*)/g, function(m, key, value) {
                qparams[decodeURIComponent(key)] = JSON.parse(decodeURIComponent(value.replace(/\+/g, " ")));
            });
            // use_qp - used by gen_url in digests
            if (qparams.use_qp) {
                mp.report.globals.params = $.extend(mp.report.globals.params, qparams);
            }
        })();

        $(document).ready(function() {
            if (mp.report.globals.events.length) {
                $('#events_wrapper_wrapper').show();

                mp.report.events.table.initialize(["2014-04-11", "2014-04-10", "2014-04-03", "2014-03-27", "2014-03-20", "2014-03-13"]);
                mp.report.events.menu.click_handlers();

                if (!document.location.hash) {
                    document.location.hash = initial_location;
                }

                var views = {
                    events: new Sextant.View(
                        function(request) {
                            mp.report.events.tutorial.maybe_show_message();

                            var p = $.extend({}, mp.report.globals.params, request.params);
                            p = mp.report.events.validate_params(p);
                            mp.report.events.views.prop_menu(p.event);

                            mp.report.events.menu.maintain_state(request.path, p, true);

                            // TODO: remove side effects - params are modified by main()
                            mp.report.events.views.main(p);
                            mp.report.events.views.advanced_events();

                            update_overview_link();
                        }
                    ),
                    properties: new Sextant.View(
                        function(request) {
                            mp.report.events.tutorial.maybe_show_message();

                            var p = $.extend({}, mp.report.globals.params, request.params);
                            p = mp.report.events.validate_params(p);
                            mp.report.events.views.prop_menu([p.event], p.name);

                            mp.report.events.menu.maintain_state(request.path, p, true);

                            mp.report.events.views.main(p);
                            mp.report.events.views.advanced_properties(p.event, p.name, p);

                            update_overview_link();
                        }
                    )
                };

                mp.report.globals.nav.UrlPatterns([
                    ["#events$", views.events],
                    ["#events/properties", views.properties]
                ]);

                mp.report.events.bookmark.hashes = {
                
                    '288d0300f8c5bc347a329aa0716242e2': true
                
                };

                mp.report.globals.nav.run(100);

                // get rid of project_id
                req = mp.report.globals.nav.getURLRequest();
                delete req.params.project_id;
                mp.report.globals.nav.setURL(req);

                mp.report.events.click_handlers();
                mp.report.advanced.click_handlers();
            } else {
                $('#tutorial').show();
                mp.report.events.tutorial.show();
            }

            update_overview_link();
        });

        $("#overview-link").click(function(event) {
            mp.report.globals.persistence.unpersist();
            window.location.hash = "#events";

            mixpanel.trends_tab.track('clicked overview');
        });

    </script>