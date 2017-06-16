// ==UserScript==
// @name STRmods ESGST
// @namespace STRmods ESGST
// @description EZPZ MODE WITH ENTER BUTTON AS IT SHOULD BE, FUKING REKT M9
// @icon https://www.dropbox.com/s/914ol7idiattpf1/strmods.ico?dl=1
// @version 69 action Beta v69.69.3
// @author STRmods and ma boi revilheart
// @contributor kek
// @downloadURL https://www.dropbox.com/s/fvn2fkes97thlr3/STRmods-ESGST.user.js?dl=1
// @updateURL https://www.dropbox.com/s/1oefnfdk0jycpmw/STRmods-ESGST.meta.js?dl=1
// @match https://www.steamgifts.com/*
// @match https://www.steamtrades.com/*
// @connect raw.githubusercontent.com
// @connect api.steampowered.com
// @connect store.steampowered.com
// @connect script.google.com
// @connect script.googleusercontent.com
// @connect sgtools.info
// @connect steamcommunity.com
// @connect steamgifts.com
// @connect steamtrades.com
// @grant GM_addStyle
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// @grant GM_listValues
// @grant GM_addValueChangeListener
// @grant GM_removeValueChangeListener
// @grant GM_getResourceText
// @grant GM_getResourceURL
// @grant GM_xmlhttpRequest
// @grant GM_info
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @require https://github.com/dinbror/bpopup/raw/master/jquery.bpopup.min.js
// @require https://cdn.steamgifts.com/js/highcharts.js
// @resource esgstIcon https://www.dropbox.com/s/914ol7idiattpf1/strmods.ico?dl=1
// @resource sgIcon https://www.dropbox.com/s/914ol7idiattpf1/strmods.ico?dl=1
// @resource stIcon https://www.dropbox.com/s/914ol7idiattpf1/strmods.ico?dl=1
// @noframes
// ==/UserScript==

(function () {
    try {
        // DOM Parser
        var DOM = {
            parser: new DOMParser(),
            parse: function (string) {
                return this.parser.parseFromString(string, `text/html`);
            }
        };

        // Script Execution
        var esgst = {};
        loadEsgst();

        // Page Events
        window.addEventListener("beforeunload", function (event) {
            if (document.getElementsByClassName("rhBusy")[0]) {
                event.returnValue = true;
                return true;
            }
        });
        window.addEventListener("hashchange", function () {
            goToComment();
        });
    } catch (error) {
        console.log(error);
        window.alert(`ESGST has failed to load. Check the console (F12) for errors and report them in the script's discussion/GitHub page.`);
    }

    function updateUserStorageToV6() {
        if (!GM_getValue(`userStorageV6`, false)) {
            GM_setValue(`users`, JSON.stringify(getUserStorageV6(GM_getValue(`Users`, []))));
            GM_setValue(`userStorageV6`, true);
        }
    }

    function getUserStorageV6(saved) {
        var i, n, users, steamId;
        users = {
            users: {},
            steamIds: {}
        };
        for (i = 0, n = saved.length; i < n; ++i) {
            steamId = saved[i].SteamID64;
            users.users[steamId] = {
                id: saved[i].ID,
                username: saved[i].Username
            };
            if (saved[i].Tags) {
                users.users[steamId].tags = saved[i].Tags.split(`, `);
            }
            if (saved[i].Notes) {
                users.users[steamId].notes = saved[i].Notes;
            }
            if (saved[i].Whitelisted) {
                users.users[steamId].whitelisted = true;
            }
            if (saved[i].Blacklisted) {
                users.users[steamId].blacklisted = true;
            }
            if (saved[i].WBC) {
                users.users[steamId].wbc = {
                    result: saved[i].WBC.Result ? saved[i].WBC.Result.replace(/^(.)/, function (m, p1) {
                        return p1.toLowerCase();
                    }) : ``,
                    giveaway: saved[i].WBC.Giveaway,
                    whitelistGiveaway: saved[i].WBC.WhitelistGiveaway,
                    groupGiveaways: saved[i].WBC.GroupGiveaways,
                    lastCheck: saved[i].WBC.LastSearch,
                    timestamp: saved[i].WBC.Timestamp
                };
            }
            if (saved[i].NAMWC) {
                users.users[steamId].namwc = {};
                if (saved[i].NAMWC.Results) {
                    users.users[steamId].namwc.results = {};
                    users.users[steamId].namwc.results.activated = saved[i].NAMWC.Results.Activated;
                    users.users[steamId].namwc.results.notActivated = saved[i].NAMWC.Results.NotActivated;
                    users.users[steamId].namwc.results.multiple = saved[i].NAMWC.Results.Multiple;
                    users.users[steamId].namwc.results.notMultiple = saved[i].NAMWC.Results.NotMultiple;
                    users.users[steamId].namwc.results.unknown = saved[i].NAMWC.Results.Unknown;
                }
                if (saved[i].NAMWC.LastSearch) {
                    users.users[steamId].namwc.lastCheck = saved[i].NAMWC.LastSearch;
                }
            }
            if (saved[i].NRF) {
                users.users[steamId].nrf = {};
                var found = saved[i].NRF.OverallProgress;
                found = found ? found.match(/(\d+) of (\d+)/) : null;
                if (found) {
                    users.users[steamId].nrf.found = parseInt(found[1]);
                    users.users[steamId].nrf.total = parseInt(found[2]);
                } else {
                    users.users[steamId].nrf.found = 0;
                    users.users[steamId].nrf.total = 0;
                }
                users.users[steamId].nrf.results = ``;
                var matches = DOM.parse(saved[i].NRF.Results).getElementsByClassName(`giveaway__summary`);
                for (var j = 0, nj = matches.length; j < nj; ++j) {
                    var outerWrap = document.createElement(`div`);
                    var innerWrap = document.createElement(`div`);
                    outerWrap.className = `giveaway__row-outer-wrap`;
                    innerWrap.className = `giveaway__row-inner-wrap`;
                    innerWrap.appendChild(matches[0]);
                    outerWrap.appendChild(innerWrap);
                    users.users[steamId].nrf.results += outerWrap.outerHTML;
                }
                users.users[steamId].nrf.lastCheck = saved[i].NRF.LastSearch;
            }
            if (saved[i].RWSCVL) {
                users.users[steamId].rwscvl = {
                    won: saved[i].RWSCVL.WonCV,
                    sent: saved[i].RWSCVL.SentCV,
                    lastCheck: saved[i].RWSCVL.LastSentCheck
                };
            }
            users.steamIds[saved[i].Username] = steamId;
        }
        return users;
    }

    function updateGameStorageToV6() {
        if (!GM_getValue(`v6GameStorage`, false)) {
            GM_setValue(`games`, JSON.stringify(getGameStorageV6(GM_getValue(`Games`, []))));
            GM_setValue(`v6GameStorage`, true);
        }
    }

    function getGameStorageV6(saved) {
        var games = {
            apps: {},
            subs: {}
        };
        for (var id in saved) {
            games.apps[id] = {};
            for (var subKey in saved[id]) {
                if (subKey === `Tags`) {
                    games.apps[id].tags = saved[id].Tags.split(`, `);
                } else if (subKey === `Entered`) {
                    games.apps[id].entered = saved[id].Entered;
                } else {
                    games.apps[id][subKey] = saved[id][subKey];
                }
            }
        }
        return games;
    }

    function updateCommentHistoryStorageToV6() {
        if (!GM_getValue(`sgCommentHistoryStorageV6`, false)) {
            GM_setValue(`sgCommentHistory`, JSON.stringify(getCommentHistoryStorageV6(GM_getValue(`CommentHistory`, ``))));
            GM_setValue(`sgCommentHistoryStorageV6`, true);
        }
    }

    function getCommentHistoryStorageV6(context) {
        var comments, i, id, match, n, saved;
        comments = [];
        saved = DOM.parse(context).getElementsByTagName(`div`);
        n = saved.length;
        if (n > 0) {
            for (i = 0, n = saved.length; i < n; ++i) {
                match = saved[i].lastElementChild;
                if (match) {
                    id = match.getAttribute(`href`).match(/\/go\/comment\/(.+)/);
                    if (id) {
                        comments.push({
                            id: id[1],
                            timestamp: parseInt(match.getAttribute(`data-timestamp`)) * 1e3
                        });
                    }
                }
            }
        }
        return comments;
    }

    function updateCommentStorageToV6() {
        if (!GM_getValue(`commentStorageV6_2`, false)) {
            GM_setValue(`comments`, JSON.stringify(getCommentStorageV6(GM_getValue(`Comments`, {}), GM_getValue(`Comments_ST`, {}))));
            GM_setValue(`commentStorageV6_2`, true);
        }
    }

    function getCommentStorageV6(savedSg, savedSt) {
        var comments, key, subKey;
        comments = {
            giveaways: {},
            discussions: {},
            tickets: {},
            trades: {}
        };
        for (key in savedSg) {
            if (!comments.discussions[key]) {
                comments.discussions[key] = {
                    comments: {}
                };
            }
            if (savedSg[key].Visited) {
                comments.discussions[key].visited = true;
            }
            if (savedSg[key].Highlighted) {
                comments.discussions[key].highlighted = true;
            }
            for (subKey in savedSg[key]) {
                if (!subKey.match(/^(Visited|Highlighted)$/)) {
                    comments.discussions[key].comments[subKey] = {
                        timestamp: savedSg[key][subKey]
                    };
                }
            }
            if (!comments.discussions[key].visited && !comments.discussions[key].highlighted && !Object.keys(comments.discussions[key].comments).length) {
                delete comments.discussions[key];
            }
        }
        for (key in savedSt) {
            if (!comments.trades[key]) {
                comments.trades[key] = {
                    comments: {}
                };
            }
            if (savedSt[key].Visited) {
                comments.trades[key].visited = true;
            }
            for (subKey in savedSt[key]) {
                if (!subKey.match(/^(Visited|Highlighted)$/)) {
                    comments.trades[key].comments[subKey] = {
                        timestamp: savedSt[key][subKey]
                    };
                }
            }
            if (!comments.trades[key].visited && !Object.keys(comments.trades[key].comments).length) {
                delete comments.trades[key];
            }
        }
        return comments;
    }

    function loadEsgst() {
        updateUserStorageToV6();
        updateGameStorageToV6();
        updateCommentHistoryStorageToV6();
        updateCommentStorageToV6();
        addStyles();
        checkNewVersion();
        esgst.sg = window.location.hostname.match(/www.steamgifts.com/);
        esgst.st = window.location.hostname.match(/www.steamtrades.com/);
        if (esgst.sg) {
            esgst.pageOuterWrapClass = `page__outer-wrap`;
            esgst.pageHeadingClass = `page__heading`;
            esgst.pageHeadingBreadcrumbsClass = `page__heading__breadcrumbs`;
            esgst.footer = document.getElementsByClassName(`footer__outer-wrap`)[0];
            esgst.replyBox = document.getElementsByClassName(`comment--submit`)[0];
            esgst.cancelButtonClass = `comment__cancel-button`;
            esgst.paginationNavigationClass = `pagination__navigation`;
            esgst.hiddenClass = `is-hidden`;
            esgst.name = `sg`;
            esgst.selectedClass = `is-selected`;
        } else {
            esgst.pageOuterWrapClass = `page_outer_wrap`;
            esgst.pageHeadingClass = `page_heading`;
            esgst.pageHeadingBreadcrumbsClass = `page_heading_breadcrumbs`;
            esgst.footer = document.getElementsByTagName(`footer`)[0];
            esgst.replyBox = document.getElementsByClassName(`reply_form`)[0];
            esgst.cancelButtonClass = `btn_cancel`;
            esgst.paginationNavigationClass = `pagination_navigation`;
            esgst.hiddenClass = `is_hidden`;
            esgst.name = `st`;
            esgst.selectedClass = `is_selected`;
        }
        esgst.currentPage = window.location.href.match(/page=(\d+)/);
        if (esgst.currentPage) {
            esgst.currentPage = parseInt(esgst.currentPage[1]);
        } else {
            esgst.currentPage = 1;
        }
        var url = window.location.href.replace(window.location.search, ``).replace(window.location.hash, ``).replace(`/search`, ``);
        esgst.originalUrl = url;
        esgst.originalTitle = document.title;
        esgst.mainPath = window.location.pathname.match(/^\/$/);
        if (esgst.mainPath) {
            url += esgst.sg ? `giveaways` : `trades`;
        }
        url += `/search?`;
        var parameters = window.location.search.replace(/^\?/, ``).split(/&/);
        for (var i = 0, n = parameters.length; i < n; ++i) {
            if (parameters[i] && !parameters[i].match(/page/)) {
                url += parameters[i] + `&`;
            }
        }
        if (window.location.search) {
            esgst.originalUrl = url.replace(/&$/, ``);
            if (esgst.currentPage > 1) {
                esgst.originalUrl += `&page=${esgst.currentPage}`;
            }
        }
        url += `page=`;
        esgst.searchUrl = url;
        esgst.userPath = window.location.pathname.match(/^\/user\//);
        refreshHeaderElements(document);
        esgst.winnersPath = window.location.pathname.match(/^\/giveaway\/.+\/winners/);
        esgst.giveawaysPath = esgst.sg && window.location.pathname.match(/^\/($|giveaways(?!.*\/(new|wishlist|created|entered|won)))/);
        esgst.giveawayCommentsPath = window.location.pathname.match(/^\/giveaway\/(?!.+\/(entries|winners|groups))/);
        esgst.discussionsTicketsTradesPath = (esgst.st && window.location.pathname.match(/^\/$/)) ||
            window.location.pathname.match(/^\/(discussions|support\/tickets|trades)/);
        esgst.originalHash = window.location.hash;
        esgst.discussionTicketTradeCommentsPath = window.location.pathname.match(/^\/(discussion|support\/ticket|trade)\//);
        esgst.archivePath = window.location.pathname.match(/^\/archive/);
        esgst.profilePath = window.location.pathname.match(/^\/account\/settings\/profile/);
        esgst.giveawayPath = window.location.pathname.match(/^\/giveaway\//);
        esgst.discussionPath = window.location.pathname.match(/^\/discussion\//);
        esgst.discussionsPath = window.location.pathname.match(/^\/discussions/);
        esgst.newGiveawayPath = window.location.pathname.match(/^\/giveaways\/new/);
        esgst.newTicketPath = window.location.pathname.match(/^\/support\/tickets\/new/);
        esgst.createdPath = window.location.pathname.match(/^\/giveaways\/created/);
        esgst.enteredPath = window.location.pathname.match(/^\/giveaways\/entered/);
        esgst.commentsPath = window.location.pathname.match(/^\/(giveaway\/(?!.*\/(entries|winners|groups))|discussion\/|support\/ticket\/|trade\/)/);
        esgst.accountPath = window.location.pathname.match(/^\/account/);
        esgst.inboxPath = window.location.pathname.match(/^\/messages/);
        esgst.groupsPath = window.location.pathname.match(/^\/account\/steam\/groups/);
        esgst.menuPath = window.location.hash.match(/#ESGST/);
        esgst.header = document.getElementsByTagName(`header`)[0];
        esgst.pagination = document.getElementsByClassName(`pagination`)[0];
        esgst.featuredContainer = document.getElementsByClassName(`featured__container`)[0];
        esgst.pageOuterWrap = document.getElementsByClassName(esgst.pageOuterWrapClass)[0];
        esgst.paginationNavigation = document.getElementsByClassName(esgst.paginationNavigationClass)[0];
        esgst.sidebar = document.getElementsByClassName(`sidebar`)[0];
        esgst.activeDiscussions = document.getElementsByClassName(`widget-container--margin-top`)[0];
        esgst.pinnedGiveaways = document.getElementsByClassName(`pinned-giveaways__outer-wrap`)[0];
        esgst.pinnedGiveawaysButton = document.getElementsByClassName(`pinned-giveaways__button`)[0];
        var mainPageHeadingIndex;
        if (esgst.commentsPath) {
            mainPageHeadingIndex = 1;
        } else {
            mainPageHeadingIndex = 0;
        }
        esgst.mainPageHeading = document.getElementsByClassName(esgst.pageHeadingClass)[mainPageHeadingIndex];
        if (!esgst.mainPageHeading && mainPageHeadingIndex === 1) {
            esgst.mainPageHeading = document.getElementsByClassName(esgst.pageHeadingClass)[0];
        }
        if (esgst.userPath) {
            esgst.featuredHeading = document.getElementsByClassName(esgst.sg ? "featured__heading" : "page_heading")[0];
            esgst.steamButton = document.querySelector("a[href*='/profiles/']");
            esgst.user = {};
            esgst.user.ID = document.querySelector("[name='child_user_id']");
            if (esgst.user.ID) {
                esgst.user.ID = esgst.user.ID.value;
            }
            esgst.user.SteamID64 = esgst.steamButton.getAttribute("href").match(/\d+/)[0];
            esgst.user.Username = esgst.sg ? esgst.featuredHeading.textContent : "";
            var matches = document.getElementsByClassName("featured__table__row__left");
            for (i = 0, n = matches.length; i < n; ++i) {
                var match = matches[i].textContent.match(/(Gifts (Won|Sent)|Contributor Level)/);
                if (match) {
                    if (match[2]) {
                        if (match[2] == `Won`) {
                            esgst.wonRow = matches[i];
                        } else {
                            esgst.sentRow = matches[i];
                        }
                    } else {
                        esgst.contributorLevelRow = matches[i];
                    }
                }
            }
        }
        var logoutButton = document.getElementsByClassName(esgst.sg ? "js__logout" : "js_logout")[0];
        if (logoutButton) {
            esgst.xsrfToken = logoutButton.getAttribute("data-form").match(/xsrf_token=(.+)/)[1];
        }
        esgst.pageTop = 25;
        esgst.commentsTop = 0;
        esgst.apPopouts = {};
        esgst.users = {};
        esgst.games = {};
        esgst.giveaways = [];
        esgst.oldValues = {
            sm_ebd: `SM_D`,
            fh: `FE_H`,
            fs: `FE_S`,
            fmph: `FE_HG`,
            ff: `FE_F`,
            hr: `hir`,
            hr_b: `hir_b`,
            hr_i: `hr_i`,
            hr_p: `pr`,
            lpv: `lpv`,
            hbs: `BSH`,
            vai: `VAI`,
            ev: `ev`,
            at: `AT`,
            at_g: `AT_G`,
            at_c24: `at_c24`,
            at_s: `at_s`,
            pnot: `pnot`,
            es: `ES`,
            es_gt: `ES_G`,
            es_gtc: `ES_GC`,
            es_dt: `ES_D`,
            es_dtc: `ES_DC`,
            es_r: `ES_R`,
            es_rs: `ES_RS`,
            dgn: `dgn`,
            hfc: `FCH`,
            ags: `AGS`,
            pgb: `PGB`,
            gf: `gf`,
            gv: `GV`,
            gwc: `gpGwc`,
            gwr: `gpGwc`,
            elgb: `gpElgb`,
            elgb_d: `elgb_d`,
            elgb_rb: `elgb_rb`,
            qgb: `qgb`,
            gb: `gb`,
            ggl: `ggp`,
            ochgb: `ochgb`,
            gt: `GTS`,
            sgg: `SGG`,
            rcvc: `rcvc`,
            ugs: `UGS`,
            er: `ER`,
            er_s: `ER_S`,
            adot: `ADOT`,
            dh: `DH`,
            mpp: `MPP`,
            mpp_fv: `MPP_FV`,
            ded: `DED`,
            ch: `CH`,
            ct: `CT`,
            ct_g: `ct_g`,
            ct_r: `ct_lu`,
            cfh: `CFH`,
            cfh_i: `CFH_I`,
            cfh_b: `CFH_B`,
            cfh_s: `CFH_S`,
            cfh_st: `CFH_ST`,
            cfh_h1: `CFH_H1`,
            cfh_h2: `CFH_H2`,
            cfh_h3: `CFH_H3`,
            cfh_bq: `CFH_BQ`,
            cfh_lb: `CFH_LB`,
            cfh_ol: `CFH_OL`,
            cfh_ul: `CFH_UL`,
            cfh_ic: `CFH_IC`,
            cfh_lc: `CFH_LC`,
            cfh_pc: `CFH_PC`,
            cfh_l: `CFH_L`,
            cfh_img: `CFH_IMG`,
            cfh_t: `CFH_T`,
            cfh_e: `CFH_E`,
            cfh_ge: `cfh_eg`,
            rbot: `rbot`,
            rbp: `MCBP`,
            mr: `MR`,
            rfi: `RFI`,
            rml: `RML`,
            ap: `AP`,
            uh: `UH`,
            un: `PUN`,
            rwscvl: `RWSCVL`,
            rwscvl_al: `RWSCVL_AL`,
            rwscvl_ro: `RWSCVL_RO`,
            ugd: `UGD`,
            gwl: `GWL`,
            gesl: `GESL`,
            as: `AS`,
            namwc: `NAMWC`,
            namwc_h: `NAWMC_H`,
            nrf: `NRF`,
            swr: `SWR`,
            luc: `LUC`,
            sgpb: `SGPB`,
            stpb: `STPB`,
            sgc: `SGC`,
            uf: `uf`,
            uf_p: `uf_p`,
            uf_d: `uf_d`,
            uf_g: `uf_g`,
            wbc: `WBC`,
            wbc_b: `WBC_B`,
            wbc_h: `WBC_H`,
            wbc_n: `wbc_n`,
            wbh: `WBH`,
            ut: `UH`,
            iwh: `IWH`,
            gh: `GH`,
            gs: `GS`,
            egh: `EGH`,
            ggt: `GT`,
            gc: `gc`,
            gc_b: `gc`,
            gc_b_r: `gc_b_r`,
            gc_w: `gc_w`,
            gc_o: `gc_o`,
            gc_i: `gc_i`,
            gc_tc: `gc_tc`,
            gc_a: `gc_a`,
            gc_mp: `gc_mp`,
            gc_sc: `gc_sc`,
            gc_dlc: `gc_dlc`,
            gc_l: `gc_l`,
            gc_m: `gc_m`,
            gc_g: `gc_g`,
            mt: `MT`,
            ged: `ged`
        };
        esgst.defaultValues = {
            elgb_d: true,
            ged: true,
            sm_hb: true,
            sm_ebd: false,
            gp: true,
            gc_b_color: `#ffffff`,
            gc_w_color: `#ffffff`,
            gc_o_color: `#ffffff`,
            gc_i_color: `#ffffff`,
            gc_tc_color: `#ffffff`,
            gc_a_color: `#ffffff`,
            gc_mp_color: `#ffffff`,
            gc_sc_color: `#ffffff`,
            gc_l_color: `#ffffff`,
            gc_m_color: `#ffffff`,
            gc_dlc_color: `#ffffff`,
            gc_g_color: `#ffffff`,
            gc_b_bgColor: `#641e16`,
            gc_o_bgColor: `#16a085`,
            gc_w_bgColor: `#3498db`,
            gc_i_bgColor: `#e74c3c`,
            gc_tc_bgColor: `#2ecc71`,
            gc_a_bgColor: `#145a32`,
            gc_mp_bgColor: `#0e6251`,
            gc_sc_bgColor: `#154360`,
            gc_l_bgColor: `#f39c12`,
            gc_m_bgColor: `#d35400`,
            gc_dlc_bgColor: `#8e44ad`,
            gc_g_bgColor: `#7f8c8d`,
            wbh_cw_color: `#ffffff`,
            wbh_cw_bgColor: `#228b22`,
            wbh_cb_color: `#ffffff`,
            wbh_cb_bgColor: `#ff4500`,
            gf_minLevel: 0,
            gf_maxLevel: 10,
            gf_minEntries: 0,
            gf_maxEntries: 999999999,
            gf_minCopies: 1,
            gf_maxCopies: 999999999,
            gf_minPoints: 0,
            gf_maxPoints: 300,
            gf_pinned: `enabled`,
            gf_group: `enabled`,
            gf_whitelist: `enabled`,
            gf_regionRestricted: `enabled`,
            gf_entered: `enabled`,
            gf_bundled: `enabled`,
            gf_tradingCards: `enabled`,
            gf_achievements: `enabled`,
            gf_multiplayer: `enabled`,
            gf_steamCloud: `enabled`,
            gf_linux: `enabled`,
            gf_mac: `enabled`,
            gf_dlc: `enabled`,
            gf_exceptionWishlist: false,
            gf_exceptionPinned: false,
            gf_exceptionGroup: false,
            gf_exceptionWhitelist: false,
            gf_exceptionRegionRestricted: false,
            gf_exceptionMultiple: false,
            gf_exceptionMultipleCopies: 1,
            gf_minLevelWishlist: 0,
            gf_maxLevelWishlist: 10,
            gf_minEntriesWishlist: 0,
            gf_maxEntriesWishlist: 999999999,
            gf_minCopiesWishlist: 1,
            gf_maxCopiesWishlist: 999999999,
            gf_minPointsWishlist: 0,
            gf_maxPointsWishlist: 300,
            gf_pinnedWishlist: `enabled`,
            gf_groupWishlist: `enabled`,
            gf_whitelistWishlist: `enabled`,
            gf_regionRestrictedWishlist: `enabled`,
            gf_enteredWishlist: `enabled`,
            gf_bundledWishlist: `enabled`,
            gf_tradingCardsWishlist: `enabled`,
            gf_achievementsWishlist: `enabled`,
            gf_multiplayerWishlist: `enabled`,
            gf_steamCloudWishlist: `enabled`,
            gf_linuxWishlist: `enabled`,
            gf_macWishlist: `enabled`,
            gf_dlcWishlist: `enabled`,
            gf_exceptionWishlistWishlist: false,
            gf_exceptionPinnedWishlist: false,
            gf_exceptionGroupWishlist: false,
            gf_exceptionWhitelistWishlist: false,
            gf_exceptionRegionRestrictedWishlist: false,
            gf_exceptionMultipleWishlist: false,
            gf_exceptionMultipleCopiesWishlist: 1,
            gf_minLevelGroup: 0,
            gf_maxLevelGroup: 10,
            gf_minEntriesGroup: 0,
            gf_maxEntriesGroup: 999999999,
            gf_minCopiesGroup: 1,
            gf_maxCopiesGroup: 999999999,
            gf_minPointsGroup: 0,
            gf_maxPointsGroup: 300,
            gf_pinnedGroup: `enabled`,
            gf_groupGroup: `enabled`,
            gf_whitelistGroup: `enabled`,
            gf_regionRestrictedGroup: `enabled`,
            gf_enteredGroup: `enabled`,
            gf_bundledGroup: `enabled`,
            gf_tradingCardsGroup: `enabled`,
            gf_achievementsGroup: `enabled`,
            gf_multiplayerGroup: `enabled`,
            gf_steamCloudGroup: `enabled`,
            gf_linuxGroup: `enabled`,
            gf_macGroup: `enabled`,
            gf_dlcGroup: `enabled`,
            gf_exceptionWishlistGroup: false,
            gf_exceptionPinnedGroup: false,
            gf_exceptionGroupGroup: false,
            gf_exceptionWhitelistGroup: false,
            gf_exceptionRegionRestrictedGroup: false,
            gf_exceptionMultipleGroup: false,
            gf_exceptionMultipleCopiesGroup: 1,
            Avatar: "",
            Username: "",
            SteamID64: "",
            Users: [],
            Games: {},
            Groups: [],
            LastRequest: 0,
            LastSave: 0,
            LastSync: 0,
            LastBundleSync: 0,
            SyncFrequency: 7,
            Comments: {},
            Comments_ST: {},
            Emojis: "",
            Rerolls: [],
            CommentHistory: "",
            StickiedGroups: [],
            Templates: [],
            Winners: {}
        };
        esgst.features = [
            // Order is important.
            {
                id: `sm_hb`,
                name: `Header Button`,
                check: getValue(`sm_hb`),
                load: loadHeaderButton
            },
            {
                id: `sm_ebd`,
                name: `Enable new features and functionalities by default.`,
                check: getValue(`sm_ebd`)
            },
            {
                id: `fh`,
                name: `Fixed Header`,
                check: getValue(`fh`),
                load: loadFixedHeader
            },
            {
                id: `fs`,
                name: `Fixed Sidebar`,
                check: getValue(`fs`) && esgst.sg && esgst.sidebar,
                load: loadFixedSidebar
            },
            {
                id: `fmph`,
                name: `Fixed Main Page Heading`,
                check: getValue(`fmph`) && esgst.mainPageHeading,
                load: loadFixedMainPageHeading
            },
            {
                id: `ff`,
                name: `Fixed Footer`,
                check: getValue(`ff`),
                load: loadFixedFooter
            },
            {
                id: `hr`,
                name: `Header Refresher`,
                options: [
                    {
                        id: `hr_i`,
                        name: `Show an icon in the title to highlight new messages.`,
                        check: getValue(`hr_i`)
                    },
                    {
                        id: `hr_p`,
                        name: `Show points in the title.`,
                        check: getValue(`hr_p`)
                    },
                    {
                        id: `hr_b`,
                        name: `Run in the background.`,
                        check: getValue(`hr_b`)
                    }
                ],
                check: getValue(`hr`),
                load: loadHeaderRefresher
            },
            {
                id: `lpv`,
                name: `Level Progress Visualizer`,
                check: getValue(`lpv`),
                load: loadLpv
            },
            {
                id: `hbs`,
                name: `Hidden Blacklist Stats`,
                check: getValue(`hbs`) && window.location.pathname.match(/^\/stats\/personal\/community/),
                load: loadHiddenBlacklistStats
            },
            {
                id: `vai`,
                name: `Visible Attached Images`,
                check: getValue(`vai`),
                load: loadVisibleAttachedImages
            },
            {
                id: `ev`,
                name: `Embedded Videos`,
                check: getValue(`ev`),
                load: loadEmbeddedVideos
            },
            {
                id: `at`,
                name: `Accurate Timestamps`,
                options: [
                    {
                        id: `at_g`,
                        name: `Enable in the main giveaway pages.`,
                        check: getValue(`at_g`)
                    },
                    {
                        id: `at_c24`,
                        name: `Use a 24-hour clock.`,
                        check: getValue(`at_c24`)
                    },
                    {
                        id: `at_s`,
                        name: `Show seconds.`,
                        check: getValue(`at_s`)
                    }
                ],
                check: getValue(`at`),
                load: loadAccurateTimestamps
            },
            {
                id: `pnot`,
                name: `Pagination Navigation On Top`,
                check: getValue(`pnot`),
                load: loadPaginationNavigationOnTop
            },
            {
                id: `qgb`,
                name: `Quick Giveaway Browsing`,
                check: getValue(`qgb`),
                load: loadQgb
            },
            {
                id: `gb`,
                name: `Giveaway Bookmarks`,
                options: [
                    {
                        id: `gb_h`,
                        name: `Highlight the header button if there is a giveaway about to end.`,
                        select: true,
                        check: getValue(`gb_h`)
                    }
                ],
                check: getValue(`gb`),
                load: loadGb
            },
            {
                id: `dgn`,
                name: `Delivered Gifts Notifier`,
                check: getValue(`dgn`),
                load: loadDeliveredGiftsNotifier
            },
            {
                id: `hfc`,
                name: `Hidden Featured Container`,
                check: getValue(`hfc`) && esgst.featuredContainer && esgst.giveawaysPath,
                load: loadHiddenFeaturedContainer
            },
            {
                id: `ags`,
                name: `Advanced Giveaway Search`,
                check: getValue(`ags`) && esgst.giveawaysPath,
                load: loadAdvancedGiveawaySearch
            },
            {
                id: `pgb`,
                name: `Pinned Giveaways Button`,
                check: getValue(`pgb`) && esgst.pinnedGiveawaysButton,
                load: loadPinnedGiveawaysButton
            },
            {
                id: `gv`,
                name: `Grid View`,
                check: getValue(`gv`) && esgst.giveawaysPath,
                load: loadGridView,
                endless: true
            },
            {
                id: `gf`,
                name: `Giveaway Filters`,
                check: getValue(`gf`),
                load: loadGf
            },
            {
                id: `gwc`,
                name: `Giveaway Winning Chance`,
                check: getValue(`gwc`),
                load: loadGwc
            },
            {
                id: `gwr`,
                name: `Giveaway Winning Ratio`,
                check: getValue(`gwr`),
                load: loadGwr
            },
            {
                id: `elgb`,
                name: `Enter/Leave Giveaway Button`,
                options: [
                    {
                        id: `elgb_d`,
                        name: `Popup description when entering.`,
                        check: getValue(`elgb_d`)
                    },
                    {
                        id: `elgb_rb`,
                        name: `Popup reply box when entering / include it in the description popup.`,
                        check: getValue(`elgb_rb`)
                    }
                ],
                check: getValue(`elgb`),
                load: loadElgb
            },
            {
                id: `ggl`,
                name: `Giveaway Groups Loader`,
                options: [
                    {
                        id: `ggl_m`,
                        name: `Only show groups that you are a member of.`,
                        check: getValue(`ggl_m`)
                    },
                    {
                        id: `ggl_p`,
                        name: `Only load groups when clicked on the group button, as a popup`,
                        check: getValue(`ggl_p`)
                    }
                ],
                check: getValue(`ggl`),
                load: loadGgl
            },
            {
                id: `ochgb`,
                name: `One-Click Hide Giveaway Button`,
                check: getValue(`ochgb`),
                load: loadOchgb
            },
            {
                id: `gt`,
                name: `Giveaway Templates`,
                check: getValue(`gt`) && esgst.sg && esgst.newGiveawayPath && !document.getElementsByClassName("table--summary")[0],
                load: loadGiveawayTemplates
            },
            {
                id: `sgg`,
                name: `Stickied Giveaway Groups`,
                check: getValue(`sgg`) && esgst.sg && (esgst.groupsPath || (esgst.newGiveawayPath && !document.getElementsByClassName("table--summary")[0])),
                load: loadStickiedGiveawayGroups
            },
            {
                id: `rcvc`,
                name: `Real CV Calculator`,
                check: getValue(`rcvc`) && esgst.newGiveawayPath,
                load: loadRealCvCalculator
            },
            {
                id: `ugs`,
                name: `Unsent Gifts Sender`,
                check: getValue(`ugs`) && esgst.sg && (esgst.newTicketPath || (esgst.createdPath && esgst.mainPageHeading)),
                load: loadUnsentGiftsSender
            },
            {
                id: `er`,
                name: `Entries Remover`,
                options: [
                    {
                        id: `er_s`,
                        name: `Remove entries upon syncing.`,
                        check: getValue(`er_s`)
                    }
                ],
                check: getValue(`er`) && ((esgst.mainPageHeading && esgst.enteredPath) || (esgst.er_s && esgst.profilePath)),
                load: loadEntriesRemover
            },
            {
                id: `gwl`,
                name: `Giveaway Winners Link`,
                check: getValue(`gwl`),
                load: loadGwl
            },
            {
                id: `gesl`,
                name: `Giveaway Error Search Links`,
                check: getValue(`gesl`) && esgst.giveawayPath,
                load: loadGiveawayErrorSearchLinks
            },
            {
                id: `as`,
                name: `Archive Searcher`,
                check: getValue(`as`) && esgst.archivePath,
                load: loadArchiveSearcher
            },
            {
                id: `adot`,
                name: `Active Discussions On Top`,
                check: getValue(`adot`) && esgst.activeDiscussions,
                load: loadActiveDiscussionsOnTop
            },
            {
                id: `dh`,
                name: `Discussions Highlighter`,
                check: getValue(`dh`),
                load: loadDh
            },
            {
                id: `mpp`,
                name: `Main Post Popup`,
                options: [
                    {
                        id: `mpp_fv`,
                        name: `Hide main post after first visit.`,
                        check: getValue(`mpp_fv`)
                    }
                ],
                check: getValue(`mpp`) && esgst.discussionPath && esgst.mainPageHeading,
                load: loadMainPostPopup
            },
            {
                id: `ded`,
                name: `Discussion Edit Detector`,
                check: getValue(`ded`) && esgst.replyBox && !esgst.userPath,
                load: loadDiscussionEditDetector
            },
            {
                id: `ch`,
                name: `Comment History`,
                check: getValue(`ch`)
            },
            {
                id: `ct`,
                name: `Comment Tracker`,
                options: [
                    {
                        id: `ct_g`,
                        name: `Fade out visited giveaways.`,
                        check: getValue(`ct_g`)
                    },
                    {
                        id: `ct_r`,
                        name: `Search for first unread comment in reverse order (from newest to oldest).`,
                        check: getValue(`ct_r`)
                    }
                ],
                check: getValue(`ct`) || getValue(`dh`),
                load: loadCt
            },
            {
                id: `cfh`,
                name: `Comment Formatting Helper`,
                options: [
                    {
                        id: `cfh_i`,
                        name: `Italic`,
                        check: getValue(`cfh_i`)
                    },
                    {
                        id: `cfh_b`,
                        name: `Bold`,
                        check: getValue(`cfh_b`)
                    },
                    {
                        id: `cfh_s`,
                        name: `Spoiler`,
                        check: getValue(`cfh_s`)
                    },
                    {
                        id: `cfh_st`,
                        name: `Strikethrough`,
                        check: getValue(`cfh_st`)
                    },
                    {
                        id: `cfh_h1`,
                        name: `Heading 1`,
                        check: getValue(`cfh_h1`)
                    },
                    {
                        id: `cfh_h2`,
                        name: `Heading 2`,
                        check: getValue(`cfh_h2`)
                    },
                    {
                        id: `cfh_h3`,
                        name: `Heading 3`,
                        check: getValue(`cfh_h3`)
                    },
                    {
                        id: `cfh_bq`,
                        name: `Blockquote`,
                        check: getValue(`cfh_bq`)
                    },
                    {
                        id: `cfh_lb`,
                        name: `Line Break`,
                        check: getValue(`cfh_lb`)
                    },
                    {
                        id: `cfh_ol`,
                        name: `Ordered List`,
                        check: getValue(`cfh_ol`)
                    },
                    {
                        id: `cfh_ul`,
                        name: `Unordered List`,
                        check: getValue(`cfh_ul`)
                    },
                    {
                        id: `cfh_ic`,
                        name: `Inline Code`,
                        check: getValue(`cfh_ic`)
                    },
                    {
                        id: `cfh_lc`,
                        name: `Line Code`,
                        check: getValue(`cfh_lc`)
                    },
                    {
                        id: `cfh_pc`,
                        name: `Paragraph Code`,
                        check: getValue(`cfh_pc`)
                    },
                    {
                        id: `cfh_l`,
                        name: `Link`,
                        check: getValue(`cfh_l`)
                    },
                    {
                        id: `cfh_img`,
                        name: `Image`,
                        check: getValue(`cfh_img`)
                    },
                    {
                        id: `cfh_t`,
                        name: `Table`,
                        check: getValue(`cfh_t`)
                    },
                    {
                        id: `cfh_e`,
                        name: `Emojis`,
                        check: getValue(`cfh_e`)
                    },
                    {
                        id: `cfh_ge`,
                        name: `Giveaway Encrypter`,
                        check: getValue(`cfh_ge`)
                    }
                ],
                check: getValue(`cfh`),
                load: loadCommentFormattingHelper,
                endless: true
            },
            {
                id: `rbot`,
                name: `Reply Box On Top`,
                check: getValue(`rbot`) && esgst.replyBox,
                load: loadReplyBoxOnTop
            },
            {
                id: `rbp`,
                name: `Reply Box Popup`,
                check: getValue(`rbp`) && esgst.replyBox && esgst.commentsPath,
                load: loadReplyBoxPopup
            },
            {
                id: `mr`,
                name: `Multi-Reply`,
                check: getValue(`mr`) && !esgst.inboxPath,
                load: loadMultiReply,
                endless: true
            },
            {
                id: `rfi`,
                name: `Reply From Inbox`,
                check: getValue(`rfi`) && esgst.inboxPath,
                load: loadMultiReply,
                endless: true
            },
            {
                check: esgst.commentsPath || esgst.inboxPath,
                hidden: true,
                name: `Comment Features`,
                load: loadCommentFeatures,
                endless: true
            },
            {
                id: `rml`,
                name: `Reply Mention Link`,
                check: getValue(`rml`),
                load: loadReplyMentionLink,
                endless: true
            },
            {
                id: `ap`,
                name: `Avatar Popout`,
                check: getValue(`ap`),
                load: loadAp
            },
            {
                id: `uh`,
                name: `Username History`,
                check: getValue(`uh`) && esgst.sg && (esgst.userPath || esgst.ap),
                load: loadUsernameHistory,
                profile: true
            },
            {
                id: `un`,
                name: `User Notes`,
                options: [
                    {
                        id: `un_wb`,
                        name: `Prompt for notes when whitelisting/blacklisting an user.`,
                        check: getValue(`un_wb`)
                    }
                ],
                check: getValue(`un`) && (esgst.userPath || (esgst.sg && esgst.ap)),
                load: loadUserNotes,
                profile: true
            },
            {
                id: `rwscvl`,
                name: `Real Won/Sent CV Links`,
                options: [
                    {
                        id: `rwscvl_al`,
                        name: `Automatically load real CV and show it on the profile.`,
                        check: getValue(`rwscvl_al`)
                    },
                    {
                        id: `rwscvl_ro`,
                        name: `Reverse order (from newest to oldest).`,
                        check: getValue(`rwscvl_ro`)
                    }
                ],
                check: getValue(`rwscvl`) && esgst.sg && (esgst.userPath || esgst.ap),
                load: loadRealWonSentCVLinks,
                profile: true
            },
            {
                id: `ugd`,
                name: `User Giveaways Data`,
                check: getValue(`ugd`) && esgst.sg && (esgst.userPath || esgst.ap),
                load: loadUserGiveawaysData,
                profile: true
            },
            {
                id: `namwc`,
                name: `Not Activated/Multiple Wins Checker`,
                options: [
                    {
                        id: `namwc_h`,
                        name: `Highlight users.`,
                        options: [
                            {
                                id: `namwc_h_i`,
                                name: `Show an icon next to the usernames instead of coloring.`,
                                check: getValue(`namwc_h_i`)
                            },
                            {
                                id: `namwc_m`,
                                name: `Highlight multiple wins as positive.`,
                                check: getValue(`namwc_m`)
                            }
                        ],
                        check: getValue(`namwc_h`)
                    }
                ],
                check: getValue(`namwc`) && esgst.sg && (esgst.userPath || esgst.winnersPath || esgst.menuPath || esgst.ap || esgst.namwc_h),
                load: loadNotActivatedMultipleWinsChecker
            },
            {
                id: `nrf`,
                name: `Not Received Finder`,
                check: getValue(`nrf`) && esgst.sg && (esgst.userPath || esgst.ap),
                load: loadNotReceivedFinder,
                profile: true
            },
            {
                id: `swr`,
                name: `Sent/Won Ratio`,
                check: getValue(`swr`) && esgst.sg && (esgst.userPath || esgst.ap),
                load: loadSentWonRatio,
                profile: true
            },
            {
                id: `luc`,
                name: `Level Up Calculator`,
                check: getValue(`luc`) && esgst.sg && (esgst.userPath || esgst.ap),
                load: loadLevelUpCalculator,
                profile: true
            },
            {
                id: `sgpb`,
                name: `SteamGifts Profile Button`,
                check: getValue(`sgpb`) && esgst.st && esgst.userPath,
                load: loadSteamGiftsProfileButton,
                profile: true
            },
            {
                id: `stpb`,
                name: `SteamTrades Profile Button`,
                check: getValue(`stpb`) && esgst.sg && (esgst.userPath || esgst.ap),
                load: loadSteamTradesProfileButton,
                profile: true
            },
            {
                id: `sgc`,
                name: `Shared Groups Checker`,
                check: getValue(`sgc`) && esgst.sg && (esgst.userPath || esgst.ap),
                load: loadSharedGroupsChecker,
                profile: true
            },
            {
                id: `uf`,
                name: `User Filters`,
                options: [
                    {
                        id: `uf_p`,
                        name: `Automatically filter out all posts from blacklisted users.`,
                        check: getValue(`uf_p`)
                    },
                    {
                        id: `uf_d`,
                        name: `Automatically filter out all discussions from blacklisted users.`,
                        check: getValue(`uf_d`)
                    },
                    {
                        id: `uf_g`,
                        name: `Automatically filter out all giveaways from blacklisted users.`,
                        check: getValue(`uf_g`)
                    }
                ],
                check: getValue(`uf`),
                load: loadUf
            },
            {
                id: `wbc`,
                name: `Whitelist/Blacklist Checker`,
                options: [
                    {
                        id: `wbc_b`,
                        name: `Show blacklist information.`,
                        check: getValue(`wbc_b`)
                    },
                    {
                        id: `wbc_h`,
                        name: `Highlight users who have whitelisted/blacklisted you.`,
                        check: getValue(`wbc_h`)
                    },
                    {
                        id: `wbc_n`,
                        name: `Save automatic notes to users that you have returned whitelist/blacklist for.`,
                        check: getValue(`wbc_n`)
                    }
                ],
                check: getValue(`wbc`) && esgst.sg && esgst.mainPageHeading,
                load: loadWhitelistBlacklistChecker
            },
            {
                id: `wbh`,
                name: `Whitelist/Blacklist Highlighter`,
                options: [
                    {
                        id: `wbh_cw`,
                        name: `Color whitelisted users instead of adding a heart icon.`,
                        colors: true,
                        check: getValue(`wbh_cw`)
                    },
                    {
                        id: `wbh_cb`,
                        name: `Color blacklisted users instead of adding a ban icon.`,
                        colors: true,
                        check: getValue(`wbh_cb`)
                    }
                ],
                check: getValue(`wbh`) && !esgst.accountPath,
                load: loadWhitelistBlacklistHighlighter,
                endless: true
            },
            {
                id: `ut`,
                name: `User Tags`,
                check: getValue(`ut`),
                load: loadUserTags,
                endless: true
            },
            {
                id: `iwh`,
                name: `Inbox Winners Highlighter`,
                check: getValue(`iwh`) && esgst.sg && (esgst.winnersPath || esgst.inboxPath),
                load: loadInboxWinnersHighlighter,
                endless: true
            },
            {
                id: `gh`,
                name: `Groups Highlighter`,
                check: getValue(`gh`) && esgst.sg && !esgst.accountPath,
                load: loadGroupsHighlighter,
                endless: true
            },
            {
                id: `gs`,
                name: `Groups Stats`,
                check: getValue(`gs`) && esgst.sg && esgst.groupsPath,
                load: loadGroupsStats,
                endless: true
            },
            {
                id: `egh`,
                name: `Entered Games Highlighter`,
                check: getValue(`egh`),
                load: loadEgh
            },
            {
                id: `gc`,
                name: `Game Categories`,
                options: [
                    {
                        id: `gc_s`,
                        name: `Enable simplified version (initials).`,
                        options: [
                            {
                                id: `gc_s_i`,
                                name: `Use icons instead of letters.`,
                                check: getValue(`gc_s_i`)
                            }
                        ],
                        check: getValue(`gc_s`)
                    },
                    {
                        id: `gc_r`,
                        name: `Rating`,
                        check: getValue(`gc_r`)
                    },
                    {
                        id: `gc_b`,
                        name: `Bundled`,
                        colors: true,
                        options: [
                            {
                                id: `gc_b_r`,
                                name: `Reverse (show only if not bundled).`,
                                check: getValue(`gc_b_r`)
                            }
                        ],
                        check: getValue(`gc_b`)
                    },
                    {
                        id: `gc_o`,
                        name: `Owned`,
                        colors: true,
                        check: getValue(`gc_o`)
                    },
                    {
                        id: `gc_w`,
                        name: `Wishlisted`,
                        colors: true,
                        check: getValue(`gc_w`)
                    },
                    {
                        id: `gc_i`,
                        name: `Ignored`,
                        colors: true,
                        check: getValue(`gc_i`)
                    },
                    {
                        id: `gc_tc`,
                        name: `Trading Cards`,
                        colors: true,
                        check: getValue(`gc_tc`)
                    },
                    {
                        id: `gc_a`,
                        name: `Achievements`,
                        colors: true,
                        check: getValue(`gc_a`)
                    },
                    {
                        id: `gc_mp`,
                        name: `Multiplayer`,
                        colors: true,
                        check: getValue(`gc_mp`)
                    },
                    {
                        id: `gc_sc`,
                        name: `Steam Cloud`,
                        colors: true,
                        check: getValue(`gc_sc`)
                    },
                    {
                        id: `gc_l`,
                        name: `Linux`,
                        colors: true,
                        check: getValue(`gc_l`)
                    },
                    {
                        id: `gc_m`,
                        name: `Mac`,
                        colors: true,
                        check: getValue(`gc_m`)
                    },
                    {
                        id: `gc_dlc`,
                        name: `DLC`,
                        colors: true,
                        check: getValue(`gc_dlc`)
                    },
                    {
                        id: `gc_g`,
                        name: `Genres`,
                        colors: true,
                        options: [
                            {
                                id: `gc_g_udt`,
                                name: `Include user-defined tags.`,
                                check: getValue(`gc_g_udt`)
                            }
                        ],
                        check: getValue(`gc_g`)
                    }
                ],
                check: getValue(`gc`),
                load: loadGc
            },
            {
                id: `ggt`,
                name: `Game Tags`,
                check: getValue(`ggt`),
                load: loadGt
            },
            {
                check: true,
                hidden: true,
                name: `Game Features`,
                load: loadGameFeatures,
                endless: true
            },
            {
                check: esgst.giveawaysPath || esgst.userPath || esgst.giveawayPath || esgst.enteredPath,
                hidden: true,
                name: `Giveaway Features`,
                load: startGiveawayFeatures
            },
            {
                id: `mt`,
                name: `Multi-Tag`,
                check: getValue(`mt`) && (esgst.ut || esgst.ggt) && !esgst.accountPath && esgst.mainPageHeading
            },
            {
                id: `ged`,
                name: `Giveaway Encrypter/Decrypter`,
                check: getValue(`ged`) && esgst.sg,
                load: loadGiveawayEncrypterDecrypter
            },
            {
                id: `es`,
                name: `Endless Scrolling`,
                options: [
                    {
                        id: `es_g`,
                        name: `Enable in the main giveaway pages.`,
                        check: getValue(`es_g`)
                    },
                    {
                        id: `es_gc`,
                        name: `Enable in the giveaway comment pages.`,
                        check: getValue(`es_gc`)
                    },
                    {
                        id: `es_dtt`,
                        name: `Enable in the main discussion/ticket/trade pages.`,
                        check: getValue(`es_dtt`)
                    },
                    {
                        id: `es_dttc`,
                        name: `Enable in the discussion/ticket/trade comment pages.`,
                        check: getValue(`es_dttc`)
                    },
                    {
                        id: `es_r`,
                        name: `Enable in the rest of the pages.`,
                        check: getValue(`es_r`)
                    },
                    {
                        id: `es_rs`,
                        name: `Enable reverse scrolling for discussions.`,
                        check: getValue(`es_rs`)
                    },
                ],
                check: getValue(`es`) && esgst.pagination && (
                    (esgst.es_g && esgst.giveawaysPath) ||
                    (esgst.es_gc && esgst.giveawayCommentsPath) ||
                    (esgst.es_dtt && esgst.discussionsTicketsTradesPath) ||
                    (esgst.es_dttc && esgst.discussionTicketTradeCommentsPath) ||
                    (esgst.es_r && !esgst.giveawaysPath && !esgst.giveawayCommentsPath &&
                        !esgst.discussionsTicketsTradesPath && !esgst.discussionTicketTradeCommentsPath)
                ),
                load: loadEndlessScrolling
            }
        ];
        esgst.failedToLoad = [];
        esgst.endlessFeatures = [];
        esgst.gameFeatures = [];
        esgst.giveawayFeatures = [];
        esgst.giveaways = [];
        esgst.commentFeatures = [];
        esgst.profileFeatures = [];
        for (var key in esgst.defaultValues) {
            getValue(key);
        }
        if (esgst.accountPath) {
            addSMButton();
        }
        getUsersGames(document);
        loadFeatures();
        if (esgst.sg) {
            checkSync();
            updateGroups();
        }
        goToComment(esgst.originalHash);
    }

    function getUsersGames(Context) {
        var Matches, I, N, UserID, Match;
        Matches = Context.querySelectorAll("a[href*='/user/']");
        esgst.currentUsers = {};
        for (I = 0, N = Matches.length; I < N; ++I) {
            Match = Matches[I].getAttribute("href").match(/\/user\/(.+)/);
            if (Match) {
                UserID = Match[1];
                if (((esgst.sg && Matches[I].textContent == UserID) || (!esgst.sg && Matches[I].textContent && !Matches[I].children.length)) && !Matches[I].closest(".markdown")) {
                    if (!esgst.users[UserID]) {
                        esgst.users[UserID] = [];
                    }
                    if (!esgst.currentUsers[UserID]) {
                        esgst.currentUsers[UserID] = [];
                    }
                    esgst.users[UserID].push(Matches[I]);
                    esgst.currentUsers[UserID].push(Matches[I]);
                }
            }
        }
    }

    function loadFeatures() {
        var features = esgst.features;
        for (var i = 0, n = features.length; i < n; ++i) {
            var feature = features[i];
            if (feature.check) {
                if (feature.load) {
                    try {
                        feature.load(document);
                        if (feature.endless) {
                            esgst.endlessFeatures.push(feature.load);
                        }
                        if (feature.profile) {
                            esgst.profileFeatures.push(feature.load);
                        }
                    } catch (error) {
                        console.log(error);
                        esgst.failedToLoad.push(feature.name);
                    }
                }
            }
        }
        var numFailed = esgst.failedToLoad.length;
        if (numFailed > 0) {
            window.alert(`${numFailed} ESGST features failed to load: ${esgst.failedToLoad.join(`, `)}. Check the console (F12) for errors and report them in the script's discussion/GitHub page.`);
        }
    }

    function getValue(name) {
        var value = GM_getValue(name);
        if (typeof value == `undefined`) {
            var oldName = esgst.oldValues[name];
            var oldValue;
            if (oldName) {
                oldValue = GM_getValue(oldName);
            }
            if (typeof oldValue == `undefined`) {
                var defaultValue = esgst.defaultValues[name];
                if (typeof defaultValue == `undefined`) {
                    value = esgst.sm_ebd;
                } else {
                    value = defaultValue;
                }
            } else {
                value = oldValue;
            }
            GM_setValue(name, value);
        }
        esgst[name] = value;
        return value;
    }

    function getTimestamp(unixTimestamp, clock24, showSeconds) {
        var months, date, month, day, year, hours, period, minutes, seconds;
        months = [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`];
        date = new Date(unixTimestamp * 1e3);
        month = date.getMonth();
        day = date.getDate();
        year = date.getFullYear();
        hours = date.getHours();
        if (clock24) {
            period = ``;
        } else {
            if (hours < 12) {
                period = `am`;
            } else {
                period = `pm`;
            }
            hours %= 12;
            if (hours === 0) {
                hours = 12;
            }
        }
        minutes = `0${date.getMinutes()}`.slice(-2);
        if (showSeconds) {
            seconds = `0${date.getSeconds()}`.slice(-2);
            seconds = `:${seconds}`;
        } else {
            seconds = ``;
        }
        return `${months[month]} ${day}, ${year}, ${hours}:${minutes}${seconds}${period}`;
    }

    function queueRequest(Element, Data, URL, Callback) {
        var CurrentDate, HTML;
        HTML = Element.Progress ? Element.Progress.innerHTML : "";
        Element.Request = setInterval(function () {
            CurrentDate = new Date().getTime();
            if ((CurrentDate - GM_getValue("LastRequest")) > 5000) {
                clearInterval(Element.Request);
                GM_setValue("LastRequest", CurrentDate);
                if (Element.Progress) {
                    Element.Progress.innerHTML = HTML;
                }
                makeRequest(Data, URL, Element.Progress, function (Response) {
                    GM_setValue("LastRequest", 0);
                    Callback(Response);
                });
            } else if (Element.Progress) {
                Element.Progress.innerHTML =
                    "<i class=\"fa fa-clock-o\"></i> " +
                    "<span>Waiting for a free request slot...</span>";
            }
        }, 500);
    }

    function makeRequest(Data, URL, Context, Callback) {
        GM_xmlhttpRequest({
            data: Data,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: (Data ? "POST" : "GET"),
            timeout: 300000,
            url: URL,
            onerror: function () {
                displayMessage(Context, "An error has ocurred.");
            },
            ontimeout: function () {
                displayMessage(Context, "The connection has timed out.");
            },
            onload: Callback
        });
    }

    function displayMessage(Context, Message) {
        if (Context) {
            Context.innerHTML =
                "<i class=\"fa fa-times-circle\"></i> " +
                "<span>" + Message + "</span>";
        } else {
            console.log(Message);
        }
    }

    function getSteamId(steamId, id, username, users, callback) {
        if (steamId && username) {
            if (users.users[steamId]) {
                callback(steamId, checkUsernameChange(users, steamId, username));
            } else {
                users.users[steamId] = {
                    username: username
                };
                if (id) {
                    users.users[steamId].id = id;
                }
                users.steamIds[username] = steamId;
                callback(steamId);
            }
        } else if (steamId) {
            if (users.users[steamId]) {
                callback(steamId);
            } else {
            request(null, false, `https://www.steamgifts.com/go/user/${steamId}`, function(response) {
                var id;
                users.users[steamId] = {};
                username = response.finalUrl.match(/\/user\/(.+)/);
                if (username) {
                    users.users[steamId].username = username[1];
                    users.steamIds[username[1]] = steamId;
                    id = DOM.parse(response.responseText).querySelector(`[name="child_user_id"]`);
                    if (id) {
                        users.users[steamId].id = id;
                    }
                }
                callback(steamId);
            });
            }
        } else {
            steamId = users.steamIds[username];
            if (steamId && users.users[steamId]) {
                callback(steamId, checkUsernameChange(users, steamId, username));
            } else {
            request(null, false, `https://www.steamgifts.com/user/${username}`, function(response) {
                var id, responseHtml;
                responseHtml = DOM.parse(response.responseText);
                steamId = responseHtml.querySelector(`[href*="/profiles/"]`).getAttribute(`href`).match(/\d+/)[0];
                if (users.users[steamId]) {
                    callback(steamId, checkUsernameChange(users, steamId, username));
                } else {
                    users.users[steamId] = {
                        username: username
                    };
                    id = responseHtml.querySelector(`[name="child_user_id"]`);
                    if (id) {
                        users.users[steamId].id = id.value;
                    }
                    users.steamIds[username] = steamId;
                    callback(steamId);
                }
            });
            }
        }
    }

    function checkUsernameChange(users, steamId, username) {
        if (users.users[steamId].username && users.users[steamId].username !== username) {
            delete users.steamIds[users.users[steamId].username];
            users.steamIds[username] = steamId;
            return true;
        }
        return false;
    }

    function queueSave(Element, Callback) {
        var CurrentDate;
        Element.Save = setInterval(function () {
            CurrentDate = new Date().getTime();
            if ((CurrentDate - GM_getValue("LastSave")) > 5000) {
                clearInterval(Element.Save);
                GM_setValue("LastSave", CurrentDate);
                if (Element.Progress) {
                    Element.Progress.innerHTML = "";
                }
                Callback();
            } else if (Element.Progress) {
                Element.Progress.innerHTML =
                    "<i class=\"fa fa-clock-o\"></i> " +
                    "<span>Waiting for a free save slot...</span>";
            }
        }, 100);
    }

    function getUserID(steamId, users, callback) {
        if (users[steamId].id) {
            callback(users[steamId].id);
        } else {
            request(null, false, `/user/${users[steamId].username}`, function(response) {
                users[steamId].id = DOM.parse(response.responseText).querySelector(`[name="child_user_id"]`).value;
                callback(users[steamId].id);
            });
        }
    }

    function saveComment(TradeCode, ParentID, Description, URL, DEDStatus, Callback, DEDCallback) {
        var Data;
        Data = "xsrf_token=" + esgst.xsrfToken + "&do=" + (esgst.sg ? "comment_new" : "comment_insert") + "&trade_code=" + TradeCode + "&parent_id=" + ParentID + "&description=" +
            encodeURIComponent(Description);
        makeRequest(Data, URL, DEDStatus, function (Response) {
            var Match, ResponseJSON;
            if (esgst.sg) {
                Match = Response.finalUrl.match(/(.+?)(#(.+))?$/);
                if (Match[3]) {
                    Callback();
                    if (esgst.ch) {
                        saveChComment(Match[3], Date.now());
                    }
                    if (DEDCallback) {
                        DEDCallback(Response, DEDStatus);
                    } else {
                        window.location.href = "/go/comment/" + Match[3];
                    }
                } else if (URL != Match[1]) {
                    makeRequest(Data, Match[1], DEDStatus, function (Response) {
                        Callback();
                        Match = Response.finalUrl.match(/(.+?)(#(.+))?$/);
                        if (esgst.ch) {
                            saveChComment(Match[3], Date.now());
                        }
                        if (DEDCallback) {
                            DEDCallback(Response, DEDStatus);
                        } else {
                            window.location.href = "/go/comment/" + Match[3];
                        }
                    });
                } else {
                    Callback();
                    if (DEDCallback) {
                        DEDCallback(Response, DEDStatus);
                    } else {
                        DEDStatus.innerHTML =
                            "<i class=\"fa fa-times-circle\"></i> " +
                            "<span>Failed!</span>";
                    }
                }
            } else {
                ResponseJSON = JSON.parse(Response.responseText);
                if (ResponseJSON.success) {
                    Callback();
                    var id = DOM.parse(ResponseJSON.html).getElementsByClassName("comment_outer")[0].id;
                    if (esgst.ch) {
                        saveChComment(id, Date.now());
                    }
                    if (DEDCallback) {
                        DEDCallback(Response, DEDStatus);
                    } else {
                        window.location.href = "/go/comment/" + id;
                    }
                } else {
                    Callback();
                    if (DEDCallback) {
                        DEDCallback(Response, DEDStatus);
                    } else {
                        DEDStatus.innerHTML =
                            "<i class=\"fa fa-times-circle\"></i> " +
                            "<span>Failed!</span>";
                    }
                }
            }
        });
    }

    function checkSync(Update, Callback) {
        var SyncFrequency, CurrentDate;
        SyncFrequency = GM_getValue("SyncFrequency");
        CurrentDate = new Date().getTime();
        if (Update) {
            document.getElementsByClassName("SMSync")[0].addEventListener("click", function () {
                setSync(CurrentDate, Update, Callback);
            });
        } else if (SyncFrequency && ((CurrentDate - GM_getValue("LastSync")) > (SyncFrequency * 86400000)) && (esgst.mainPath || esgst.accountPath)) {
            setSync(CurrentDate, Update, Callback);
        }
    }

    function setSync(CurrentDate, Update, Callback) {
        var Popup, Sync;
        Popup = createPopup();
        if (!Update) {
            var context = document.getElementsByClassName(`nav__left-container`)[0];
            var html = `
<div class="nav__button-container">
<div class="nav__button">
<div class="rhBusy"></div>
<i class="fa fa-refresh fa-spin"></i>
<span>Syncing...</span>
</div>
</div>
`;
            context.insertAdjacentHTML(`beforeEnd`, html);
            var button = context.lastElementChild.firstElementChild;
            button.addEventListener(`click`, function () {
                Popup.popUp();
            });
        }
        Popup.Icon.classList.add("fa-refresh");
        Popup.Title.textContent = Update ? "Syncing..." : "ESGST is performing the automatic sync. Please do not reload / close the page until it has finished.";
        Sync = {};
        createButton(Popup.Button, "fa-times-circle", "Cancel", "", "", function () {
            Sync.Canceled = true;
            Popup.Close.click();
        }, null, true);
        Sync.Progress = Popup.Progress;
        Sync.OverallProgress = Popup.OverallProgress;
        if (Update) {
            Popup.popUp().reposition();
        }
        sync(Sync, function (CurrentDate) {
            Popup.Icon.classList.remove("fa-refresh");
            Popup.Icon.classList.add("fa-check");
            Popup.Title.textContent = Update ? "Synced!" : "ESGST has finished the automatic sync. You can now reload / close the page.";
            Popup.Button.innerHTML = "";
            Sync.Progress.innerHTML = Sync.OverallProgress.innerHTML = "";
            if (Update) {
                Popup.Close.click();
                Callback(CurrentDate);
            } else {
                button.classList.remove(`rhBusy`);
                button.innerHTML = `
<i class="fa fa-check-circle"></i>
<span>Synced!</span>
`;
            }
            GM_setValue("LastSync", CurrentDate);
        });
    }

    function sync(Sync, Callback) {
        Sync.OverallProgress.innerHTML =
            "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
            "<span>Syncing your username and avatar...</span>";
        if (esgst.sg) {
            GM_setValue("Username", document.getElementsByClassName("nav__avatar-outer-wrap")[0].href.match(/\/user\/(.+)/)[1]);
        }
        GM_setValue("Avatar", document.getElementsByClassName(esgst.sg ? "nav__avatar-inner-wrap" : "nav_avatar")[0].style.backgroundImage.match(/\("(.+)"\)/)[1]);
        if (!GM_getValue("SteamID64") && GM_getValue("Username")) {
            getSteamID64(Sync, function () {
                continueSync(Sync, Callback);
            });
        } else {
            continueSync(Sync, Callback);
        }
    }

    function continueSync(Sync, Callback) {
        Sync.OverallProgress.innerHTML =
            "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
            "<span>Syncing your Steam groups...</span>";
        Sync.Groups = [];
        syncGroups(Sync, "/account/steam/groups/search?page=", 1, function () {
            GM_setValue("Groups", Sync.Groups);
            syncWhitelistBlacklist(Sync, function () {
                syncGames(Sync, function () {
                    var CurrentDate;
                    CurrentDate = new Date();
                    GM_setValue("LastSync", CurrentDate.getTime());
                    Callback(CurrentDate);
                });
            });
        });
    }

    function getSteamID64(Sync, Callback) {
        Sync.OverallProgress.innerHTML =
            "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
            "<span>Retrieving your SteamID64...</span>";
        makeRequest(null, "/user/" + GM_getValue("Username"), Sync.Progress, function (Response) {
            GM_setValue("SteamID64", DOM.parse(Response.responseText).querySelector("a[href*='/profiles/']").getAttribute("href").match(/\d+/)[0]);
            Callback();
        });
    }

    function syncGroups(Sync, URL, NextPage, Callback) {
        if (!Sync.Canceled) {
            queueRequest(Sync, null, URL + NextPage, function (Response) {
                var ResponseHTML, Matches, I, N, Pagination;
                ResponseHTML = DOM.parse(Response.responseText);
                Matches = ResponseHTML.getElementsByClassName("table__column__heading");
                for (I = 0, N = Matches.length; I < N; ++I) {
                    Sync.Groups.push({
                        Code: Matches[I].getAttribute("href").match(/group\/(.+?)\//)[1],
                        Name: Matches[I].textContent
                    });
                }
                Pagination = ResponseHTML.getElementsByClassName("pagination__navigation")[0];
                if (Pagination && !Pagination.lastElementChild.classList.contains("is-selected")) {
                    syncGroups(Sync, URL, ++NextPage, Callback);
                } else {
                    Callback();
                }
            });
        }
    }

    function syncWhitelistBlacklist(Sync, Callback) {
        var SavedUsers;
        if (!Sync.Canceled) {
            createLock(`userLock`, 300, function(deleteLock) {
                SavedUsers = JSON.parse(GM_getValue(`users`));
                for (var key in SavedUsers.users) {
                    delete SavedUsers.users[key].whitelisted;
                    delete SavedUsers.users[key].whitelistedDate;
                    delete SavedUsers.users[key].blacklisted;
                    delete SavedUsers.users[key].blacklistedData;
                }
                GM_setValue(`users`, JSON.stringify(SavedUsers));
                deleteLock();
                Sync.OverallProgress.innerHTML =
                    "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                    "<span>Syncing your whitelist...</span>";
                window.setTimeout(getWhitelistBlacklist, 0, Sync, "/account/manage/whitelist/search?page=", 1, "whitelisted", function () {
                    Sync.OverallProgress.innerHTML =
                        "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                        "<span>Syncing your blacklist...</span>";
                    window.setTimeout(getWhitelistBlacklist, 0, Sync, "/account/manage/blacklist/search?page=", 1, "blacklisted", Callback);
                });
            });
        }
    }

    function getWhitelistBlacklist(Sync, URL, NextPage, Key, Callback) {
        if (!Sync.Canceled) {
            request(null, true, URL + NextPage, function (Response) {
                var ResponseHTML, Matches;
                ResponseHTML = DOM.parse(Response.responseText);
                Matches = ResponseHTML.getElementsByClassName("table__row-outer-wrap");
                getWhitelistBlacklistUsers(Sync, 0, Matches.length, Matches, Key, function () {
                    var Pagination;
                    Pagination = ResponseHTML.getElementsByClassName("pagination__navigation")[0];
                    if (Pagination && !Pagination.lastElementChild.classList.contains("is-selected")) {
                        window.setTimeout(getWhitelistBlacklist, 0, Sync, URL, ++NextPage, Key, Callback);
                    } else {
                        Callback();
                    }
                });
            });
        }
    }

    function getWhitelistBlacklistUsers(Sync, I, N, Matches, Key, Callback) {
        if (!Sync.Canceled) {
            if (I < N) {
                var username = Matches[I].getElementsByClassName(`table__column__heading`)[0].textContent;
                var date = parseInt(Matches[I].querySelector(`[data-timestamp]`).getAttribute(`data-timestamp`)) * 1e3;
                createLock(`userLock`, 300, function(deleteLock) {
                    var users = JSON.parse(GM_getValue(`users`));
                    getSteamId(null, null, username, users, function(steamId) {
                        users.users[steamId][Key] = true;
                        users.users[steamId][Key + "Date"] = date;
                        GM_setValue(`users`, JSON.stringify(users));
                        deleteLock();
                        window.setTimeout(getWhitelistBlacklistUsers, 0, Sync, ++I, N, Matches, Key, Callback);
                    });
                });
            } else {
                Callback();
            }
        }
    }

    function syncGames(sync, callback) {
        var key, ind;
        sync.OverallProgress.innerHTML = `
<i class="fa fa-circle-o-notch fa-spin"></i>
<span>Syncing your wishlist / owned games / ignored games...</span>
`;
        var steamApiKey = GM_getValue(`steamApiKey`, GM_getValue(`SteamAPIKey`));
        var url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${GM_getValue(`SteamID64`)}&format=json`;
        makeRequest(null, url, sync.Progress, function (response) {
            var responseText = response.responseText;
            var i, n, id;
            var owned = 0;
            createLock(`gameLock`, 300, function (deleteLock) {
                var games = JSON.parse(GM_getValue(`games`));
                for (key in games.apps) {
                    delete games.apps[key].wishlist;
                    delete games.apps[key].wishlisted;
                    delete games.apps[key].owned;
                    delete games.apps[key].ignored;
                    if (!Object.keys(games.apps[key]).length) {
                        delete games.apps[key];
                    }
                }
                for (key in games.subs) {
                    delete games.subs[key].wishlist;
                    delete games.subs[key].wishlisted;
                    delete games.subs[key].owned;
                    delete games.subs[key].ignored;
                    if (!Object.keys(games.subs[key]).length) {
                        delete games.subs[key];
                    }
                }
                if (!responseText.match(/<title>Forbidden<\/title>/)) {
                    var ownedGames = JSON.parse(responseText).response.games;
                    for (i = 0, n = ownedGames.length; i < n; ++i) {
                        id = ownedGames[i].appid;
                        if (!games.apps[id]) {
                            games.apps[id] = {};
                        }
                        games.apps[id].owned = true;
                        ++owned;
                    }
                }
                url = `http://store.steampowered.com/dynamicstore/userdata`;
                makeRequest(null, url, sync.Progress, function (response) {
                    var responseJson = JSON.parse(response.responseText);
                    var numOwned = responseJson.rgOwnedApps.length;
                    if (numOwned > 0) {
                        var types = [
                            {
                                name: `rgWishlist`,
                                mainKey: `apps`,
                                key: `wishlisted`
                            },
                            {
                                name: `rgOwnedApps`,
                                mainKey: `apps`,
                                key: `owned`
                            },
                            {
                                name: `rgOwnedPackages`,
                                mainKey: `subs`,
                                key: `owned`
                            },
                            {
                                name: `rgIgnoredApps`,
                                mainKey: `apps`,
                                key: `ignored`
                            },
                            {
                                name: `rgIgnoredPackages`,
                                mainKey: `subs`,
                                key: `ignored`
                            }
                        ];
                        for (var i = 0, n = types.length; i < n; ++i) {
                            var values = responseJson[types[i].name];
                            var mainKey = types[i].mainKey;
                            key = types[i].key;
                            for (var j = 0, numValues = values.length; j < numValues; ++j) {
                                var id = values[j];
                                if (!games[mainKey][id]) {
                                    games[mainKey][id] = {};
                                }
                                var oldValue = games[mainKey][id][key];
                                games[mainKey][id][key] = true;
                                if (key == `owned` && !oldValue) {
                                    ++owned;
                                }
                            }
                        }
                        if (owned != GM_getValue(`ownedGames`, 0)) {
                            GM_setValue(`ownedGames`, owned);
                            ind = 1;
                        } else {
                            ind = 2;
                        }
                    } else {
                        ind = 3;
                    }
                    GM_setValue(`games`, JSON.stringify(games));
                    deleteLock();
                    callback(ind, games);
                });
            });
        });
    }

    function sortArray(Array) {
        return Array.sort(function (A, B) {
            return A.localeCompare(B, {
                sensitivity: "base"
            });
        });
    }

    function setSiblingsOpacity(Element, Opacity) {
        var Siblings, I, N;
        Siblings = Element.parentElement.children;
        for (I = 0, N = Siblings.length; I < N; ++I) {
            if (Siblings[I] != Element) {
                Siblings[I].style.opacity = Opacity;
            }
        }
    }

    function setHoverOpacity(Element, EnterOpacity, LeaveOpacity) {
        Element.addEventListener("mouseenter", function () {
            Element.style.opacity = EnterOpacity;
        });
        Element.addEventListener("mouseleave", function () {
            Element.style.opacity = LeaveOpacity;
        });
    }

    /*
     * Helper Functions
     */

    /* Lock */

    function doLock(key, uuid) {
        GM_setValue(key, JSON.stringify({
            timestamp: Date.now(),
            uuid: uuid
        }));
    }

    function createLock(key, threshold, callback) {
        var uuid;
        uuid = `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, function (c) {
            var r, v;
            r = Math.random() * 16 | 0;
            v = c == `x` ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        checkLock(key, threshold, uuid, callback);
    }

    function checkLock(key, threshold, uuid, callback) {
        var lock, locked;
        locked = JSON.parse(GM_getValue(key, `{}`));
        if (!locked || !locked.uuid || locked.timestamp < Date.now() - threshold) {
            doLock(key, uuid);
            window.setTimeout(function () {
                locked = JSON.parse(GM_getValue(key, `{}`));
                if (locked && locked.uuid === uuid) {
                    lock = window.setInterval(doLock, threshold / 2, key, uuid);
                    callback(function () {
                        window.clearInterval(lock);
                        GM_deleteValue(key);
                    });
                } else {
                    checkLock(key, threshold, uuid, callback);
                }
            }, threshold / 2);
        } else {
            window.setTimeout(checkLock, threshold / 3, key, threshold, uuid, callback);
        }
    }

    /* Request */

    function request(data, queue, url, callback) {
        if (queue) {
            createLock(`requestLock`, 1500, function (closeLock) {
                continueRequest(data, url, callback, closeLock);
            });
        } else {
            continueRequest(data, url, callback);
        }
    }

    function continueRequest(data, url, callback, closeLock) {
        GM_xmlhttpRequest({
            data: data,
            headers: {
                "Content-Type": `application/x-www-form-urlencoded`
            },
            method: data ? `POST` : `GET`,
            url: url,
            onload: function (response) {
                if (closeLock) {
                    closeLock();
                }
                callback(response);
            }
        });
    }

    /* Popup */

    function createPopup_v6(icon, title, temp) {
        var popup;
        popup = {};
        popup.popup = insertHtml(document.body, `beforeEnd`, `
            <div class="page__outer-wrap page_outer_wrap esgst-popup">
                <div class="popup_summary">
                    <div class="popup_icon">
                        <i class="popup__icon fa ${icon} esgst-popup-icon"></i>
                    </div>
                    <div class="popup__heading popup_heading">
                        <div class="popup_heading_h2 esgst-popup-title">${title}</div>
                    </div>
                </div>
                <div class="popup_description esgst-popup-description"></div>
                <div class="popup__actions popup_actions">
                    <span class="b-close">Close</span>
                </div>
            </div>
        `);
        popup.description = popup.popup.firstElementChild.nextElementSibling;
        popup.open = function (callback) {
            popup.popup.classList.add(`popup`);
            popup.opened = $(popup.popup).bPopup({
                amsl: [0],
                fadeSpeed: 200,
                followSpeed: 500,
                modalColor: `#3c424d`,
                opacity: 0.85,
                onClose: function () {
                    if (temp) {
                        popup.popup.remove();
                    } else {
                        popup.popup.classList.remove(`popup`);
                    }
                    if (popup.close) {
                        popup.close();
                    }
                }
            }, callback);
        };
        popup.reposition = function () {
            if (popup.opened) {
                popup.opened.reposition();
            }
        };
        popup.popup.addEventListener(`click`, popup.reposition);
        return popup;
    }

    /* */

    function createPopup(Temp) {
        var Popup;
        document.body.insertAdjacentHTML(
            "beforeEnd",
            "<div class=\"popup page__outer-wrap page_outer_wrap rhPopup\">" +
            "    <div class=\"popup_summary\">" +
            "        <div class=\"popup_icon\">" +
            "            <i class=\"fa popup__icon rhPopupIcon\"></i>" +
            "        </div>" +
            "        <div class=\"popup_heading popup__heading\">" +
            "            <div class=\"popup_heading_h2 rhPopupTitle\"></div>" +
            "        </div>" +
            "    </div>" +
            "    <div class=\"rhPopupDescription\">" +
            "        <textarea class=\"rhPopupTextArea rhHidden\"></textarea>" +
            "        <input class=\"rhPopupTextInput rhHidden\"/>" +
            "        <ul class=\"rhPopupOptions\"></ul>" +
            "        <div class=\"rhPopupButton\"></div>" +
            "        <div class=\"rhPopupStatus\">" +
            "            <div class=\"rhPopupProgress\"></div>" +
            "            <div class=\"rhPopupOverallProgress\"></div>" +
            "        </div>" +
            "        <ul class=\"rhPopupResults\"></ul>" +
            "    </div>" +
            "    <div class=\"popup__actions popup_actions\">" +
            "        <a href=\"https://www.steamgifts.com/account#ESGST\">Manage</a>" +
            "        <span class=\"b-close rhPopupClose\">Close</span>" +
            "    </div>" +
            "</div>"
        );
        Popup = {};
        Popup.Popup = document.body.lastElementChild;
        Popup.Icon = Popup.Popup.getElementsByClassName("rhPopupIcon")[0];
        Popup.Title = Popup.Popup.getElementsByClassName("rhPopupTitle")[0];
        Popup.Description = Popup.Popup.getElementsByClassName("rhPopupDescription")[0];
        Popup.TextArea = Popup.Popup.getElementsByClassName("rhPopupTextArea")[0];
        Popup.TextInput = Popup.Popup.getElementsByClassName("rhPopupTextInput")[0];
        Popup.Options = Popup.Popup.getElementsByClassName("rhPopupOptions")[0];
        Popup.Button = Popup.Popup.getElementsByClassName("rhPopupButton")[0];
        Popup.Status = Popup.Popup.getElementsByClassName("rhPopupStatus")[0];
        Popup.Progress = Popup.Popup.getElementsByClassName("rhPopupProgress")[0];
        Popup.OverallProgress = Popup.Popup.getElementsByClassName("rhPopupOverallProgress")[0];
        Popup.Results = Popup.Popup.getElementsByClassName("rhPopupResults")[0];
        Popup.Close = Popup.Popup.getElementsByClassName("rhPopupClose")[0];
        if (esgst.st) {
            Popup.Popup.classList.remove(`popup`);
            Popup.Popup.classList.add(`esgst-hidden`);
        }
        var popup;
        Popup.popUp = function (Callback) {
            if (esgst.st) {
                Popup.Popup.classList.add(`popup`);
                Popup.Popup.classList.remove(`esgst-hidden`);
            }
            popup = $(Popup.Popup).bPopup({
                amsl: [0],
                fadeSpeed: 200,
                followSpeed: 500,
                modalColor: "#3c424d",
                opacity: 0.85,
                onClose: function () {
                    if (esgst.st) {
                        Popup.Popup.classList.remove(`popup`);
                        Popup.Popup.classList.add(`esgst-hidden`);
                    }
                    if (Temp) {
                        Popup.Popup.remove();
                    }
                }
            }, Callback);
            return popup;
        };
        Popup.Popup.addEventListener(`click`, function () {
            if (popup) {
                popup.reposition();
            }
        });
        return Popup;
    }

    /* Popout */

    function createPopout_v6(className) {
        var currentContext, popout;
        popout = {};
        popout.popout = insertHtml(document.body, `beforeEnd`, `<div class="${className} esgst-popout esgst-hidden"></div>`);
        popout.open = function(context) {
            currentContext = context;
            popout.popout.classList.remove(`esgst-hidden`);
            popout.reposition(context);
        };
        popout.close = function() {
            popout.popout.classList.add(`esgst-hidden`);
        };
        popout.reposition = function() {
            var contextLeft, contextRect, contextTop, contextWidth, popoutHeight, popoutWidth;
            popout.popout.style.left = `0`;
            popout.popout.style.top = `0`;
            contextRect = currentContext.getBoundingClientRect();
            contextLeft = contextRect.left;
            contextTop = contextRect.top;
            contextWidth = contextRect.width;
            popoutHeight = popout.popout.offsetHeight;
            popoutWidth = popout.popout.offsetWidth;
            if (contextLeft + popoutWidth > document.documentElement.clientWidth) {
                popout.popout.style.left = `${contextLeft - popoutWidth + contextWidth}px`;
            } else {
                popout.popout.style.left = `${contextLeft}px`;
            }
            if (contextTop + popoutHeight > document.documentElement.clientHeight) {
                popout.popout.style.top = `${contextTop - popoutHeight + window.scrollY}px`;
            } else {
                popout.popout.style.top = `${contextTop + contextWidth + window.scrollY}px`;
            }
        };
        document.addEventListener(`click`, function(event) {
            if (!popout.popout.contains(event.target) && !currentContext.contains(event.target)) {
                popout.close();
            }
        });
        return popout;
    }

    function createPopout(Context) {
        var Popout;
        Context.insertAdjacentHTML("beforeEnd", "<div class=\"page__outer-wrap page_outer_wrap rhPopout rhHidden\"></div>");
        Popout = {
            Popout: Context.lastElementChild,
            customRule: function () {
                return true;
            },
            popOut: function (Context, Callback) {
                if (Callback) {
                    Callback(Popout.Popout);
                }
                Popout.reposition(Context);
            },
            reposition: function (Context) {
                Popout.Popout.classList.remove("rhHidden");
                Popout.Popout.removeAttribute("style");
                repositionPopout(Popout.Popout, Context);
            }
        };
        document.addEventListener("click", function (Event) {
            if (!Popout.Popout.classList.contains("rhHidden") && document.body.contains(Event.target) && !Popout.Popout.contains(Event.target) && Popout.customRule(Event.target)) {
                Popout.Popout.classList.add("rhHidden");
            }
        });
        return Popout;
    }

    function repositionPopout(Popout, Context) {
        var PopoutRect, PopoutLeft, PopoutWidth, PopoutTop, PopoutHeight, ContextRect, ContextLeft, ContextWidth, ContextTop, ContextHeight;
        PopoutRect = Popout.getBoundingClientRect();
        PopoutLeft = PopoutRect.left;
        PopoutWidth = PopoutRect.width;
        PopoutTop = PopoutRect.top;
        PopoutHeight = PopoutRect.height;
        ContextRect = Context.getBoundingClientRect();
        ContextLeft = ContextRect.left;
        ContextWidth = ContextRect.width;
        ContextTop = ContextRect.top;
        ContextHeight = ContextRect.height;
        Popout.style.marginLeft = ((PopoutLeft + PopoutWidth) > document.documentElement.clientWidth) ?
            (-(PopoutWidth - ContextWidth - (ContextLeft - PopoutLeft)) + "px") : ((ContextLeft - PopoutLeft) + "px");
        if ((PopoutHeight + ContextTop + ContextHeight + 44) > document.documentElement.clientHeight) {
            Popout.style.marginTop = (PopoutTop > ContextTop) ? (-(PopoutHeight + (PopoutTop - ContextTop)) + "px") : (-(PopoutHeight - (ContextTop - PopoutTop)) + "px");
        } else {
            Popout.style.marginTop = (PopoutTop > ContextTop) ? (((ContextTop - PopoutTop) + ContextHeight) + "px") : (-((PopoutTop - ContextTop) - ContextHeight) + "px");
        }
    }

    /* Button Set */

    function createButtonSet(color1, color2, icon1, icon2, title1, title2, callback1, callback2) {
        var button1, button2, classes, set;
        set = {};
        set.set = document.createElement(`div`);
        set.set.className = `esgst-button-set`;
        classes = {
            green: `form__submit-button`,
            grey: `form__saving-button`,
            red: `sidebar__error`,
            yellow: `sidebar__entry-delete`
        };
        set.set.innerHTML = `
            <div class="${classes[color1]} btn_action ${color1}">
                <i class="fa ${icon1}"></i>
                <span>${title1}</span>
            </div>
            <div class="${classes[color2]} btn_action ${color2} is-disabled is_disabled esgst-hidden">
                <i class="fa ${icon2}"></i>
                <span>${title2}</span>
            </div>
        `;
        button1 = set.set.firstElementChild;
        button2 = set.set.lastElementChild;
        set.toggle = function (callback) {
            button1.classList.toggle(`esgst-hidden`);
            button2.classList.toggle(`esgst-hidden`);
            if (callback) {
                callback(set.toggle);
            }
        };
        set.trigger = function () {
            set.toggle(callback1);
        };
        button1.addEventListener(`click`, set.toggle.bind(null, callback1));
        if (callback2) {
            button2.classList.remove(`is-disabled`, `is_disabled`);
            button2.addEventListener(`click`, set.toggle.bind(null, callback2));
        }
        return set;
    }

    /* */

    function createButton(Context, DefaultIcon, DefaultName, OnClickIcon, OnClickName, DefaultCallback, OnClickCallback, White, Yellow) {
        var DefaultButton, OnClickButton;
        Context.innerHTML =
            "<div class=\"" + (White ? "form__saving-button white" : (Yellow ? "sidebar__entry-delete" : "form__submit-button green")) + " btn_action rhDefaultButton\">" +
            "    <i class=\"fa " + DefaultIcon + "\"></i>" +
            "    <span>" + DefaultName + "</span>" +
            "</div>" +
            "<div class=\"form__saving-button btn_action grey is-disabled is_disabled rhOnClickButton rhHidden\">" +
            "    <i class=\"fa " + OnClickIcon + "\"></i>" +
            "    <span>" + OnClickName + "</span>" +
            "</div>";
        DefaultButton = Context.firstElementChild;
        OnClickButton = Context.lastElementChild;
        DefaultButton.addEventListener("click", function () {
            DefaultButton.classList.add("rhHidden");
            OnClickButton.classList.remove("rhHidden");
            DefaultCallback(function () {
                OnClickButton.classList.add("rhHidden");
                DefaultButton.classList.remove("rhHidden");
            });
        });
        if (OnClickCallback) {
            OnClickButton.classList.remove("is-disabled", "is_disabled");
            OnClickButton.addEventListener("click", function () {
                OnClickButton.classList.add("rhHidden");
                DefaultButton.classList.remove("rhHidden");
                OnClickCallback();
            });
        }
    }

    function createCheckbox(Context, Default) {
        var Checkbox, Input, Disabled, Hover, Enabled;
        Context.innerHTML =
            "<span class=\"rhCheckbox\">" +
            "    <input class=\"rhHidden\" type=\"checkbox\">" +
            "    <i class=\"fa fa-circle-o\"></i>" +
            "    <i class=\"fa fa-circle rhHidden\"></i>" +
            "    <i class=\"fa fa-check-circle rhHidden\"></i>" +
            "</span>";
        Checkbox = Context.firstElementChild;
        Input = Checkbox.firstElementChild;
        Disabled = Input.nextElementSibling;
        Hover = Disabled.nextElementSibling;
        Enabled = Hover.nextElementSibling;
        Input.checked = Default;
        Checkbox.addEventListener("mouseenter", setCheckboxHover);
        Checkbox.addEventListener("mouseleave", setCheckboxDisabled);
        Checkbox.addEventListener("click", function () {
            Input.checked = Input.checked ? false : true;
            setCheckboxEnabled();
        });
        setCheckboxEnabled();

        function setCheckboxHover() {
            Disabled.classList.add("rhHidden");
            Enabled.classList.add("rhHidden");
            Hover.classList.remove("rhHidden");
        }

        function setCheckboxDisabled() {
            Hover.classList.add("rhHidden");
            Enabled.classList.add("rhHidden");
            Disabled.classList.remove("rhHidden");
        }

        function setCheckboxEnabled() {
            if (Input.checked) {
                Disabled.classList.add("rhHidden");
                Hover.classList.add("rhHidden");
                Enabled.classList.remove("rhHidden");
                Checkbox.removeEventListener("mouseenter", setCheckboxHover);
                Checkbox.removeEventListener("mouseleave", setCheckboxDisabled);
            } else {
                Enabled.classList.add("rhHidden");
                Disabled.classList.remove("rhHidden");
                Checkbox.addEventListener("mouseenter", setCheckboxHover);
                Checkbox.addEventListener("mouseleave", setCheckboxDisabled);
            }
        }

        return {
            Checkbox: Input,
            check: function () {
                Input.checked = true;
                setCheckboxEnabled();
            },
            uncheck: function () {
                Input.checked = false;
                setCheckboxEnabled();
            },
            toggle: function () {
                Input.checked = Input.checked ? false : true;
                setCheckboxEnabled();
            }
        };
    }

    function createCheckbox_v6(context, defaultValue, threeState) {
        var html = `
<span class="esgst-checkbox">
<input class="esgst-hidden" type="checkbox">
<i class="fa fa-circle-o"></i>
<i class="fa fa-circle"></i>
<i class="fa fa-check-circle"></i>
</span>
`;
        context.insertAdjacentHTML(`afterBegin`, html);
        var checkbox = {
            value: defaultValue,
            threeState: threeState
        };
        checkbox.checkbox = context.firstElementChild;
        checkbox.input = checkbox.checkbox.firstElementChild;
        checkbox.disabled = checkbox.input.nextElementSibling;
        checkbox.none = checkbox.disabled.nextElementSibling;
        checkbox.enabled = checkbox.none.nextElementSibling;
        checkbox.showNone = showNoneCheckbox.bind(null, checkbox);
        checkbox.hideNone = hideNoneCheckbox.bind(null, checkbox);
        if (!checkbox.threeState) {
            if (checkbox.value) {
                checkbox.input.checked = true;
                checkbox.disabled.classList.add(`esgst-hidden`);
                checkbox.none.classList.add(`esgst-hidden`);
            } else {
                checkbox.input.checked = false;
                checkbox.none.classList.add(`esgst-hidden`);
                checkbox.disabled.classList.add(`esgst-hidden`);
                checkbox.checkbox.addEventListener(`mouseenter`, checkbox.showNone);
                checkbox.checkbox.addEventListener(`mouseleave`, checkbox.hideNone);
            }
            checkbox.checkbox.addEventListener(`click`, changeCheckboxState.bind(null, checkbox, true));
            changeCheckboxState(checkbox);
        } else {
            if (checkbox.value == `disabled`) {
                checkbox.none.classList.add(`esgst-hidden`);
                checkbox.enabled.classList.add(`esgst-hidden`);
            } else if (checkbox.value == `none`) {
                checkbox.disabled.classList.add(`esgst-hidden`);
                checkbox.enabled.classList.add(`esgst-hidden`);
            } else {
                checkbox.disabled.classList.add(`esgst-hidden`);
                checkbox.none.classList.add(`esgst-hidden`);
            }
            checkbox.checkbox.addEventListener(`click`, changeCheckboxState.bind(null, checkbox));
        }
        checkbox.check = checkCheckbox.bind(null, checkbox);
        checkbox.uncheck = uncheckCheckbox.bind(null, checkbox);
        checkbox.toggle = toggleCheckbox.bind(null, checkbox);
        return checkbox;
    }

    function showNoneCheckbox(checkbox) {
        checkbox.disabled.classList.add(`esgst-hidden`);
        checkbox.none.classList.remove(`esgst-hidden`);
    }

    function hideNoneCheckbox(checkbox) {
        checkbox.disabled.classList.remove(`esgst-hidden`);
        checkbox.none.classList.add(`esgst-hidden`);
    }

    function checkCheckbox(checkbox) {
        checkbox.input.checked = true;
        changeCheckboxState(checkbox);
    }

    function uncheckCheckbox(checkbox) {
        checkbox.input.checked = false;
        changeCheckboxState(checkbox);
    }

    function toggleCheckbox(checkbox) {
        if (checkbox.input.checked) {
            checkbox.input.checked = false;
        } else {
            checkbox.input.checked = true;
        }
        changeCheckboxState(checkbox);
    }

    function changeCheckboxState(checkbox, toggle) {
        if (!checkbox.threeState) {
            if (toggle) {
                if (checkbox.input.checked) {
                    checkbox.input.checked = false;
                } else {
                    checkbox.input.checked = true;
                }
            }
            if (checkbox.input.checked) {
                checkbox.value = true;
                checkbox.disabled.classList.add("esgst-hidden");
                checkbox.none.classList.add("esgst-hidden");
                checkbox.enabled.classList.remove("esgst-hidden");
                checkbox.checkbox.removeEventListener("mouseenter", checkbox.showNone);
                checkbox.checkbox.removeEventListener("mouseleave", checkbox.hideNone);
            } else {
                checkbox.value = false;
                checkbox.enabled.classList.add("esgst-hidden");
                checkbox.disabled.classList.remove("esgst-hidden");
                checkbox.checkbox.addEventListener("mouseenter", checkbox.showNone);
                checkbox.checkbox.addEventListener("mouseleave", checkbox.hideNone);
            }
        } else {
            if (checkbox.value == `disabled`) {
                checkbox.disabled.classList.add(`esgst-hidden`);
                checkbox.none.classList.remove(`esgst-hidden`);
                checkbox.value = `none`;
            } else if (checkbox.value == `none`) {
                checkbox.none.classList.add(`esgst-hidden`);
                checkbox.enabled.classList.remove(`esgst-hidden`);
                checkbox.value = `enabled`;
            } else {
                checkbox.enabled.classList.add(`esgst-hidden`);
                checkbox.disabled.classList.remove(`esgst-hidden`);
                checkbox.value = `disabled`;
            }
        }
    }

    function createOptions(Context, Element, Options) {
        var I, N;
        for (I = 0, N = Options.length; I < N; ++I) {
            createOption(Context, Options[I], Element);
        }
    }

    function createOption(Context, Option, Element) {
        var Name, Checkbox, Key, ID, Dependency;
        Context.insertAdjacentHTML(
            "beforeEnd",
            "<li" + (Option.Check() ? "" : " class=\"rhHidden\"") + ">" +
            "    <span></span>" +
            "    <span>" + Option.Description + "</span>" +
            "    <i class=\"fa fa-question-circle\" title=\"" + Option.Title + "\"></i>" +
            "</li>"
        );
        Name = Option.Name;
        Element[Name] = Context.lastElementChild;
        Checkbox = Element[Name].firstElementChild;
        Key = Option.Key;
        ID = Option.ID;
        Element[Key] = createCheckbox(Checkbox, GM_getValue(ID)).Checkbox;
        Dependency = Option.Dependency;
        Checkbox.addEventListener("click", function () {
            GM_setValue(ID, Element[Key].checked);
            if (Dependency) {
                Element[Dependency].classList.toggle("rhHidden");
            }
        });
    }

    function createResults(Context, Element, Results) {
        var I, N, Key;
        for (I = 0, N = Results.length; I < N; ++I) {
            Context.insertAdjacentHTML(
                "beforeEnd",
                "<li class=\"rhHidden\">" + Results[I].Icon +
                "    <span class=\"rhBold\">" + Results[I].Description + " (<span>0</span>):</span>" +
                "    <span class=\"popup__actions\"></span>" +
                "</li>"
            );
            Key = Results[I].Key;
            Element[Key] = Context.lastElementChild;
            Element[Key + "Count"] = Element[Key].firstElementChild.nextElementSibling.firstElementChild;
            Element[Key + "Users"] = Element[Key].lastElementChild;
        }
    }

    function createDescription(Description) {
        return (
            "<form>" +
            "    <div class=\"form__input-description rhDescription\">" +
            "        <div class=\"input_description\">" + Description + "</div>" +
            "    </div>" +
            "</form>"
        );
    }

    function createNavigationSection(Name, Items) {
        var Section, I, N;
        Section =
            "<h3 class=\"sidebar__heading\">" + Name + "</h3>" +
            "<ul class=\"sidebar__navigation\">";
        for (I = 0, N = Items.length; I < N; ++I) {
            Section += createNavigationItem(Items[I].Name, Items[I].URL, Items[I].Title);
        }
        Section += "</ul>";
        return Section;
    }

    function createNavigationItem(Name, URL, Title) {
        return (
            "<li class=\"sidebar__navigation__item" + (Name ? (" " + Name) : "") + "\">" +
            "    <a class=\"sidebar__navigation__item__link\" href=\"" + URL + "\">" +
            "        <div class=\"sidebar__navigation__item__name\">" + Title + "</div>" +
            "        <div class=\"sidebar__navigation__item__underline\"></div>" +
            "    </a>" +
            "</li>"
        );
    }

    function addStyles() {
        var Temp, Positive, Negative, Unknown;
        var colors = [
            {
                id: `gc_b`,
                key: `bundled`,
                mainKey: `esgst-gc`
            },
            {
                id: `gc_b_r`,
                key: `bundled`,
                mainKey: `esgst-gc`
            },
            {
                id: `gc_w`,
                key: `wishlisted`,
                mainKey: `esgst-gc`
            },
            {
                id: `gc_o`,
                key: `owned`,
                mainKey: `esgst-gc`
            },
            {
                id: `gc_i`,
                key: `ignored`,
                mainKey: `esgst-gc`
            },
            {
                id: `gc_tc`,
                key: `tradingCards`,
                mainKey: `esgst-gc`
            },
            {
                id: `gc_a`,
                key: `achievements`,
                mainKey: `esgst-gc`
            },
            {
                id: `gc_mp`,
                key: `multiplayer`,
                mainKey: `esgst-gc`
            },
            {
                id: `gc_sc`,
                key: `steamCloud`,
                mainKey: `esgst-gc`
            },
            {
                id: `gc_l`,
                key: `linux`,
                mainKey: `esgst-gc`
            },
            {
                id: `gc_m`,
                key: `mac`,
                mainKey: `esgst-gc`
            },
            {
                id: `gc_dlc`,
                key: `dlc`,
                mainKey: `esgst-gc`
            },
            {
                id: `gc_g`,
                key: `genres`,
                mainKey: `esgst-gc`
            },
            {
                id: `wbh_cw`,
                key: `whitelisted`,
                mainKey: `esgst-wbh-highlight`
            },
            {
                id: `wbh_cb`,
                key: `blacklisted`,
                mainKey: `esgst-wbh-highlight`
            }
        ];
        var style;
        for (var i = 0, n = colors.length; i < n; ++i) {
            var color = GM_getValue(`${colors[i].id}_color`);
            var backgroundColor = GM_getValue(`${colors[i].id}_bgColor`);
            style = `
.${colors[i].mainKey}.${colors[i].key} {
color: ${color} !important;
background-color: ${backgroundColor} !important;
}
`;
            GM_addStyle(style);
        }
        document.body.insertAdjacentHTML(
            "beforeEnd",
            "<span class=\"dropdown_btn\">" +
            "    <i class=\"icon-green green\"></i>" +
            "    <i class=\"icon-red red\"></i>" +
            "    <i class=\"icon-grey grey\"></i>" +
            "</span>"
        );
        Temp = document.body.lastElementChild;
        Positive = Temp.firstElementChild;
        Negative = Positive.nextElementSibling;
        Unknown = Negative.nextElementSibling;
        Positive = window.getComputedStyle(Positive).color;
        Negative = window.getComputedStyle(Negative).color;
        Unknown = window.getComputedStyle(Unknown).color;
        Temp.remove();
        style = `
.esgst-ggl-panel {
padding: 5px;
}

.esgst-ggl-panel >*:not(:last-child) {
margin-right: 10px;
}

.esgst-ggl-panel >* {
box-shadow: none;
}

.esgst-ggl-panel i {
cursor: default;
border: 0;
}

.esgst-ggl-member {
font-weight: bold;
}

.esgst-ggl-button {
cursor: pointer;
}

.esgst-popout {
position: absolute;
left: 0;
top: 0;
}

.esgst-popup {
display: none;
max-width: 75%;
max-height: 75%;
overflow: auto;
}

.esgst-heading-button {
display: inline-block;
cursor: pointer;
}

.esgst-popup .popup__actions {
margin-top: 25px;
}

.esgst-button-set {
margin-top: 25px;
}

.esgst-popup-icon {
height: 48px;
width: 48px;
}

.esgst-popup-title span {
font-weight: bold;
}

.rhPopupDescription.left, .esgst-text-left {
text-align: left;
}
.esgst-hidden {
display: none !important;
}

.fa img {
height: 14px;
width: 14px;
vertical-align: middle;
}
.nav__left-container .fa img {
vertical-align: baseline;
}

.esgst-checkboxm, .esgst-hb-update, .esgst-hb-changelog, .esgst-dh-view-button {
cursor: pointer;
}

.esgst-hr-delivered i {
color: #FECC66;
}

.esgst-adot, .esgst-rbot {
margin-bottom: 25px;
}

.esgst-rbot .reply_form .btn_cancel {
display: none;
}

.esgst-fh {
height: auto !important;
position: fixed;
top: 0;
width: 100%;
z-index: 999 !important;
}

.esgst-fs {
position: fixed;
}

.esgst-fmph {
position: fixed;
z-index: 998;
}

.esgst-fmph-background {
padding: 0;
position: fixed;
top: 0;
z-index: 997;
}

.esgst-ff {
background-color: inherit;
bottom: 0;
padding: 0;
position: fixed;
width: 100%;
z-index: 999;
}

.esgst-ff >* {
padding: 15px 25px;
}

.esgst-lpv-container >* {
background-image: none !important;
}

.esgst-ags-panel {
margin: 0 0 15px 0;
}

.esgst-ags-filter {
display: flex;
}

.esgst-ags-filter >* {
display: inline-flex;
justify-content: space-between;
margin: 5px;
width: 150px;
}

.esgst-ags-panel input, .esgst-ags-panel select {
padding: 0 5px;
width: 50px;
}

.esgst-aas-button, .esgst-es-pause-button, .esgst-es-refresh-button {
cursor: pointer;
display: inline-block;
}

.esgst-es-page-heading {
margin-top: 25px;
}

.esgst-gc {
display: inline-block;
margin: 0;
margin-bottom: 5px;
margin-top: 5px;
position: static;
text-shadow: none;
}

.esgst-gc.rating i {
color: #fff !important;
}

.esgst-gc.rating.positive {
background-color: #66c0f4;
}

.esgst-gc.rating.negative {
background-color: #a34c25;
}

.esgst-gc.rating.mixed {
background-color: #b9a074;
}

.esgst-gf-container input {
display: inline-block;
height: 20px;
padding: 0 5px;
width: 100px;
}

.esgst-gf-filters >* {
display: inline-block;
margin: 5px;
vertical-align: top;
}

.esgst-gf-basic-filter {
display: flex;
}

.esgst-gf-basic-filter >* {
display: inline-flex;
width: 200px;
margin: 5px;
justify-content: space-between;
}

.esgst-gf-type-filter, .esgst-gf-category-filter, .esgst-gf-exception-filter, .esgst-gf-legend {
margin: 5px;
}

.esgst-gf-button {
border-top: 1px;
}

.esgst-uh-box {
background-position: center;
margin: 5px 0 0;
padding: 15px;
position: absolute;
text-align: center;
width: auto;
}

.esgst-uh-title {
margin: 0 0 15px;
}

.esgst-wbh-highlight {
border: none !important;
border-radius: 4px;
padding: 2px 5px;
text-shadow: none;
}

.page__heading__breadcrumbs .esgst-wbh-highlight {
padding: 0 2px;
}

.esgst-sm-colors input {
display: inline-block;
padding: 0;
width: 30px;
}

.esgst-sm-colors-default {
line-height:normal;
padding: 5px 15px;
}

.esgst-ged-icon {
margin: 0 0 0 10px;
}

.PGBContainer, .esgst-gf-box {
border-radius: 0 !important;
margin: 0! important;
}

.ERButton {
cursor: pointer;
display: inline-block;
}

.esgst-egh-icon {
cursor: pointer;
}

.giveaway__row-outer-wrap .esgst-egh-button, .table__row-outer-wrap .esgst-egh-button {
margin-right: 5px;
}

p.table__column__heading {
display: inline-block;
}

.MTGameCheckbox ~ .table__row-outer-wrap {
display: inline-block;
}

.esgst-gt-panel {
border: 0! important;
cursor: pointer;
display: inline-block;
line-height: normal;
text-decoration: none !important;
}

.esgst-gt-tags >* {
display: inline-block !important;
height: auto;
margin: 0;
padding: 2px;
width: auto;
}

.esgst-gt-tags >:not(:first-child) {
margin-left: 5px;
}

.giveaway__row-outer-wrap .esgst-gt-panel, .table__row-outer-wrap .esgst-gt-panel {
margin-left: 5px;
}

.esgst-giveaway-links {
float: left;
margin: 2px;
}

.esgst-giveaway-panel.giveaway__columns {
float: right;
margin: 2px;
}

.esgst-giveaway-panel .esgst-button-set {
border: 0;
padding: 0;
}

.esgst-giveaway-panel .esgst-button-set >* {
line-height: inherit;
margin:0;
}

.esgst-giveaway-panel >:first-child {
margin: 0;
}

.esgst-giveaway-panel >*:not(:first-child) {
margin: 0 0 0 5px;
}

.esgst-giveaway-panel .form__submit-button, .esgst-giveaway-panel .form__saving-button {
margin-bottom: 0;
min-width: 0;
}

.GVContainer .giveaway__columns:not(.esgst-giveaway-panel) {
display: block;
}

.GVContainer .giveaway__columns:not(.esgst-giveaway-panel) >:first-child {
margin: 0;
}
`;
        GM_addStyle(style);
        GM_addStyle(
            ".markdown {" +
            "    word-break: break-word;" +
            "}" +
            ".rhHidden {" +
            "    display: none !important;" +
            "}" +
            ".rhBold {" +
            "    font-weight: bold;" +
            "}" +
            ".rhItalic {" +
            "    font-style: italic;" +
            "}" +
            ".rhBusy >*, .CFHALIPF {" +
            "    opacity: 0.2;" +
            "}" +
            ".rhPopup {" +
            "    max-height: 75%;" +
            "    overflow: auto;" +
            "    min-width: 300px;" +
            "   max-width: 75%;" +
            "}" +
            ".rhPopupLarge {" +
            "    width: 75%;" +
            "}" +
            ".rhPopupIcon {" +
            "    height: 48px;" +
            "    width: 48px;" +
            "}" +
            ".rhPopupTitle span {" +
            "    font-weight: bold;" +
            "}" +
            ".rhPopupTextArea {" +
            "    max-height: 200px !important;" +
            "    min-height: 200px !important;" +
            "}" +
            ".rhPopupOptions, .rhDescription, .SMFeatures {" +
            "    margin: 5px;" +
            "}" +
            ".rhPopupButton {" +
            "    display: flex;" +
            "    justify-content: center;" +
            "    margin: 15px 0 0;" +
            "}" +
            ".rhPopupButton div {" +
            "    justify-content: center;" +
            "    line-height: normal;" +
            "    margin: 0 !important;" +
            "    min-width: 200px;" +
            "    padding: 7px 15px;" +
            "}" +
            ".rhPopupButton div >* {" +
            "    flex: 0;" +
            "}" +
            ".rhPopupStatus {" +
            "    margin: 15px 0;" +
            "}" +
            ".rhPopupResults {" +
            "    margin: 0 0 15px;" +
            "}" +
            ".rhPopupResults >:not(:last-child) {" +
            "    margin: 0 0 15px;" +
            "}" +
            ".rhPopupResults .popup__actions, .comment__actions .RMLLink {" +
            "    margin: 0 0 0 10px;" +
            "}" +
            ".rhPopupResults .popup__actions >* {" +
            "    border: 0;" +
            "    cursor: initial;" +
            "    display: inline-block;" +
            "}" +
            ".rhPopupResults .popup__actions a {" +
            "    border-bottom: 1px dotted;" +
            "}" +
            ".rhPopupResults .table__row-outer-wrap {" +
            "    margin: 0;" +
            "    text-align: left;" +
            "}" +
            ".rhPopout {" +
            "    align-self: baseline;" +
            "    background-color: #fff;" +
            "    border: 1px solid #d2d6e0;" +
            "    border-radius: 5px;" +
            "    cursor: initial;" +
            "    font-size: 12px;" +
            "    height: auto;" +
            "    line-height: normal;" +
            "    max-height: 600px;" +
            "    padding: 5px !important;" +
            "    position: absolute;" +
            "    text-align: left;" +
            "    text-shadow: none;" +
            "    white-space: nowrap;" +
            "    z-index: 997;" +
            "}" +
            ".rhCheckbox, .esgst-ap-avatar {" +
            "    cursor: pointer;" +
            "}" +
            ".rhWBIcon, .esgst-wbh-icon, .esgst-namwc-icon {" +
            "    display: inline-block;" +
            "    line-height: normal;" +
            "    margin: 0 5px 0 0;" +
            "}" +
            ".rhWBIcon i, .esgst-wbh-icon i, .esgst-namwc-icon i {" +
            "    border: 0;" +
            "    line-height: normal;" +
            "    margin: 0;" +
            "    text-shadow: none !important;" +
            "}" +
            ".SMMenu .form__submit-button {" +
            "    margin: 0 5px;" +
            "}" +
            ".SMTags >* {" +
            "    display: none;" +
            "}" +
            ".SMManageDataPopup, .SMImport, .SMExport, .SMDelete, .SMTag {" +
            "    display: block;" +
            "}" +
            ".nav__row.SMRecentUsernameChanges, .nav__row.SMCommentHistory {" +
            "    display: flex;" +
            "}" +
            ".SMRecentUsernameChangesPopup a, .SMComments a {" +
            "    border-bottom: 1px dotted;" +
            "}" +
            ".SMSyncFrequency {" +
            "    display: block;" +
            "    width: 200px;" +
            "}" +
            ".HMBox {" +
            "    position: relative;" +
            "}" +
            ".ESHeading {" +
            "    margin: 0 0 5px;" +
            "}" +
            ".ESRecentDiscussions {" +
            "    margin: 25px 0;" +
            "}" +
            ".ESCommentBox {" +
            "    margin: 5px 0 15px;" +
            "    padding: 0;" +
            "}" +
            ".ESPanel >*:not(:last-child), .esgst-ap-popout .featured__table__row__left:not(.esgst-uh-title), .MRReply, .MREdit {" +
            "    margin: 0 10px 0 0;" +
            "}" +
            ".ESStatus {" +
            "    margin: 5px 0;" +
            "    text-align: center;" +
            "}" +
            ".GVView {" +
            "    text-align: center;" +
            "}" +
            ".pinned-giveaways__inner-wrap--minimized.GVView .giveaway__row-outer-wrap:nth-child(-n+8) {" +
            "    display: inline-block;" +
            "}" +
            ".GVContainer {" +
            "    border: 0 !important;" +
            "    box-shadow: none !important;" +
            "    display: inline-block;" +
            "    margin: 5px;" +
            "    padding: 0;" +
            "    vertical-align: top;" +
            "}" +
            ".GVIcons {" +
            "    position: absolute;" +
            "    width: 25px;" +
            "}" +
            ".GVIcons >:not(.GGPContainer) {" +
            "    text-align: center;" +
            "}" +
            ".GVIcons >* {" +
            "    border-radius: 2px;" +
            "    display: block;" +
            "    line-height: normal;" +
            "    padding: 2px;" +
            "    margin: 0 !important;" +
            "}" +
            ".GVBox {" +
            "    display: block;" +
            "    margin: 0 0 0 25px;" +
            "}" +
            ".GVBox >:first-child {" +
            "    margin: 0 !important;" +
            "}" +
            ".is-faded.GVBox {" +
            "    opacity: 1;" +
            "}" +
            ".is-faded.GVBox .global__image-outer-wrap--game-medium {" +
            "    opacity: 0.5;" +
            "}" +
            ".GVInfo {" +
            "    align-items: center;" +
            "    display: flex;" +
            "    max-width: 600px;" +
            "    position: absolute;" +
            "    text-align: left;" +
            "    z-index: 1;" +
            "}" +
            ".GVInfo >:last-child {" +
            "    margin: -35px 0 0 5px;" +
            "}" +
            ".GVInfo .text-right {" +
            "    text-align: left;" +
            "}" +
            ".GVInfo .GPLinks, .GVInfo .GPPanel {" +
            "    float: none;" +
            "}" +
            ".SMManageData, .SMManageFilteredUsers, .SMRecentUsernameChanges, .SMCommentHistory, .SMManageTags, .ESPanel .pagination__navigation >*, .ESPanel .pagination_navigation >*, .ESRefresh, .ESPause," +
            ".esgst-un-button, .MTButton, .MTAll, .MTNone, .MTInverse, .WBCButton, .NAMWCButton, .NRFButton, .UGDButton, .GTSView, .UGSButton, .GDCBPButton, .CTGoToUnread, .CTMarkRead," +
            ".CTMarkVisited, .MCBPButton, .MPPButton, .ASButton {" +
            "    cursor: pointer;" +
            "    display: inline-block;" +
            "}" +
            ".SGPBButton i, .SGPBButton img {" +
            "    height: 14px;" +
            "    width: 14px;" +
            "}" +
            ".SGCBox .table__row-inner-wrap {" +
            "    padding: 0 10px;" +
            "}" +
            ".PUTButton i, .MTUserCheckbox i, .MTGameCheckbox i, .CFHPanel span >:first-child >* {" +
            "    margin: 0 !important;" +
            "}" +
            ".PUTButton {" +
            "    border: 0! important;" +
            "    cursor: pointer;" +
            "    display: inline-block;" +
            "    line-height: normal;" +
            "    margin: 0 0 0 5px;" +
            "    text-decoration: none !important;" +
            "}" +
            ".author_name + .PUTButton {" +
            "    margin: 0 5px 0 0;" +
            "}" +
            ".PUTTags {" +
            "    font-size: 10px;" +
            "    font-weight: bold;" +
            "}" +
            ".PUTTags >* {" +
            "    display: inline-block !important;" +
            "    height: auto;" +
            "    margin: 0;" +
            "    padding: 1px 2px;" +
            "    width: auto;" +
            "}" +
            ".PUTTags >:not(:first-child), .CTPanel >:not(:first-child) {" +
            "    margin: 0 0 0 5px;" +
            "}" +
            ".MTTag {" +
            "    display: inline-block;" +
            "}" +
            ".MTUserCheckbox, .MTGameCheckbox {" +
            "    display: inline-block;" +
            "    margin: 0 5px 0 0;" +
            "}" +
            ".esgst-namwc-highlight {" +
            "    font-weight: bold;" +
            "}" +
            ".positive, .positive i {" +
            "    color: " + Positive + " !important;" +
            "}" +
            ".negative, .negative i {" +
            "    color: " + Negative + " !important;" +
            "}" +
            ".unknown, .unknown i {" +
            "    color: " + Unknown + " !important;" +
            "}" +
            ".UGDData {" +
            "    width: 100%;" +
            "}" +
            ".UGDData tr:hover {" +
            "    background-color: rgba(119, 137, 154, 0.2);" +
            "}" +
            ".UGDData th {" +
            "    border: 1px solid;" +
            "    font-weight: bold;" +
            "    padding: 5px;" +
            "}" +
            ".UGDData td {" +
            "    border: 1px solid;" +
            "    padding: 5px;" +
            "}" +
            ".UGDData td:first-child {" +
            "    font-weight: bold;" +
            "}" +
            ".IWHIcon {" +
            "    margin: 0 0 0 5px;" +
            "}" + /* from SquishedPotato's dark theme */ `
.APBox .featured__inner-wrap .APLink[href*="group"] {
	top: -30px;
            }
            .esgst-ap-popout {
                border-radius: 5px;
            	box-shadow: 0 0 10px 2px hsla(0, 0%, 0%, 0.8);
            	min-width: 400px;
                padding: 0;
                text-shadow: none;
                z-index: 9999;
            }

            .esgst-ap-popout .featured__outer-wrap:not(.esgst-uh-box) {
    	        border-radius: 5px;
                padding: 5px;
                width: auto;
                white-space: normal;
            }

            .esgst-ap-popout .featured__inner-wrap {
                align-items: flex-start;
	            padding: 0 5px 0 0;
            }

            .esgst-ap-popout .featured__heading {
                margin: 0;
            }

            .esgst-ap-popout .featured__heading__medium {
                font-size: 18px;
            }

            .esgst-ap-link {
	            width: 100px;
            }

            .esgst-ap-link .global__image-outer-wrap--avatar-large {
	            box-sizing: content-box !important;
	            height: 64px !important;
                margin: 5px;
	            width: 64px !important;
            }

            .esgst-ap-popout .global__image-outer-wrap--avatar-large:hover {
            	background-color: hsla(0, 0%, 25%, 0.2) !important;
            }

            .esgst-ap-link .global__image-inner-wrap {
	            background-size: cover !important;
            }

            .esgst-ap-popout .sidebar__shortcut-inner-wrap {
            	margin: 10px 0;
            }

            .esgst-ap-popout .sidebar__shortcut-inner-wrap i {
	            height: 18px;
	            font-size: 12px;
            }

            .esgst-ap-popout .sidebar__shortcut-inner-wrap * {
            	line-height: 18px;
            	vertical-align: middle;
            }

            .esgst-ap-popout .sidebar__shortcut-inner-wrap img {
            	height: 16px;
            	vertical-align: baseline !important;
            	width: 16px;
            }

            .esgst-ap-popout .featured__table {
                display: inline-block;
                width: 100%;
            }

            .esgst-ap-popout .featured__table__row {
                padding: 2px;
            }

            .esgst-ap-popout .featured__table__row:nth-child(n + 3) {
            	margin-left: -95px;
            }

            .esgst-ap-popout .featured__table__row:last-of-type .featured__table__row__right * {
            	font-size: 11px;
            }

            ` +
            ".GTSApply, .GTSDelete, .esgst-ct-comment-button {" +
            "    cursor: pointer;" +
            "}" +
            ".GTSSave {" +
            "    display: inline-block;" +
            "    margin: 0 0 0 5px;" +
            "}" +
            ".SGGSticky {" +
            "    cursor: pointer;" +
            "    margin: 0 5px 0 0;" +
            "    opacity: 0.5;" +
            "}" +
            ".SGGUnsticky {" +
            "    cursor: pointer;" +
            "    margin: 0 5px 0 0;" +
            "}" +
            ".AGSPanel {" +
            "    margin: 0 0 15px 0;" +
            "}" +
            ".AGSFilter {" +
            "    display: flex;" +
            "}" +
            ".AGSFilter >* {" +
            "    display: inline-flex;" +
            "    justify-content: space-between;" +
            "    margin: 5px;" +
            "    width: 150px;" +
            "}" +
            ".AGSPanel input, .AGSPanel select {" +
            "    padding: 0 5px;" +
            "    width: 50px;" +
            "}" +
            ".ELGBButton, .ELGBButton + div {" +
            "    background: none;" +
            "    border: 0;" +
            "    box-shadow: none;" +
            "    padding: 0;" +
            "}" +
            ".ELGBButton >*, .ELGBButton + div >* {" +
            "    line-height: inherit;" +
            "    margin: 0;" +
            "}" +
            ".popup__keys__list .esgst-ggl-member, .esgst-dh-highlighted, .esgst-dh-highlighted.table__row-outer-wrap, .GHHighlight {" +
            "    background-color: " + Positive.replace(/rgb/, "rgba").replace(/\)/, ", 0.2)") + " !important;" +
            "    padding: 5px !important;" +
            "}" +
            ".esgst-gb-highlighted {" +
            "    background-color: " + Negative.replace(/rgb/, "rgba").replace(/\)/, ", 0.8)") + " !important;" +
            "    background-image: none !important;" +
            "}" +
            ".esgst-ct-comment-read:hover, .esgst-ct-visited:hover {" +
            "    background-color: " + Unknown.replace(/rgb/, "rgba").replace(/\)/, ", 0.1)") + " !important;" +
            "}" +
            ".esgst-gb-button, .esgst-dh-button {" +
            "    cursor: pointer; display: inline-block;" +
            "    margin: 0 5px 0 0;" +
            "}" +
            ".comment__actions .esgst-ct-comment-button {" +
            "    margin: 0 0 0 10px;" +
            "}" +
            ".comment__actions >:first-child + .esgst-ct-comment-button {" +
            "    margin: 0;" +
            "}" +
            ".CFHPanel {" +
            "    margin: 0 0 2px;" +
            "    text-align: left;" +
            "}" +
            ".CFHPanel >* {" +
            "    display: inline-block;" +
            "    margin: 1px !important;" +
            "    padding: 0;" +
            "}" +
            ".CFHPanel span >:first-child {" +
            "    cursor: pointer;" +
            "    display: flex;" +
            "    padding: 0 5px;" +
            "}" +
            ".CFHPanel span >:not(:first-child), .DEDStatus {" +
            "    display: block;" +
            "}" +
            ".CFHPanel span i {" +
            "    line-height: 22px;" +
            "}" +
            ".CFHPanel .form__saving-button {" +
            "    display: inline-block;" +
            "    margin: 5px;" +
            "    min-width:0;" +
            "}" +
            ".CFHPanel table {" +
            "    display: block;" +
            "    max-height: 200px;" +
            "    max-width: 375px;" +
            "    overflow: auto;" +
            "}" +
            ".CFHPanel table td:first-child {" +
            "   min-width: 25px;" +
            "   text-align: center;" +
            "}" +
            ".CFHPanel table td:not(:first-child) {" +
            "   min-width: 75px;" +
            "   text-align: center;" +
            "}" +
            ".CFHEmojis {" +
            "    display: block !important;" +
            "    font-size: 18px;" +
            "    max-height: 200px;" +
            "    min-height: 30px;" +
            "    overflow: auto;" +
            "    text-align: center;" +
            "}" +
            ".CFHEmojis >* {" +
            "    cursor: pointer;" +
            "    display: inline-block;" +
            "    margin: 2px;" +
            "}" +
            ".CFHPanel ~ textarea {" +
            "    max-height: 475px;" +
            "}" +
            ".CFHPopout {" +
            "    white-space: normal;" +
            "    width: 300px;" +
            "}" +
            ".MPPPostOpen {" +
            "    display: none;" +
            "    max-height: 75%;" +
            "    overflow: auto;" +
            "    padding: 15px;" +
            "    position: absolute;" +
            "    width: 75%;" +
            "}"
        );
    }

    function goToComment(hash, Element) {
        var ID, Top, Permalink;
        if (!hash) {
            hash = window.location.hash;
        }
        ID = hash.replace(/#/, "");
        if (ID && !window.location.pathname.match(/^\/account/)) {
            if (!Element) Element = document.getElementById(ID);
            if (Element) {
                Top = Element.offsetTop;
                window.scrollTo(0, Top);
                window.scrollBy(0, -esgst.commentsTop);
                Permalink = document.getElementsByClassName(esgst.sg ? "comment__permalink" : "author_permalink")[0];
                if (Permalink) {
                    Permalink.remove();
                }
                Element.getElementsByClassName(esgst.sg ? "comment__username" : "author_avatar")[0].insertAdjacentHTML(
                    esgst.sg ? "beforeBegin" : "afterEnd",
                    "<div class=\"comment__permalink\">" +
                    "    <i class=\"fa fa-share author_permalink\"></i>" +
                    "</div>"
                );
            }
        }
    }

    function updateGroups() {
        var Popup;
        if (!GM_getValue("GSync")) {
            Popup = createPopup(true);
            Popup.Icon.classList.add("fa-refresh", "fa-spin");
            Popup.Title.textContent = "ESGST is updating your groups. Please wait...";
            Popup.Groups = [];
            syncGroups(Popup, "/account/steam/groups/search?page=", 1, function () {
                GM_setValue("GSync", true);
                GM_setValue("Groups", Popup.Groups);
                Popup.Title.textContent = "Done. You can close this now.";
            });
            Popup.popUp();
        }
    }

    function syncBundleList(callback) {
        var popup = createPopup();
        popup.Icon.classList.add("fa-refresh");
        popup.Title.textContent = "Syncing...";
        var sync = {};
        createButton(popup.Button, "fa-times-circle", "Cancel", "", "", function () {
            sync.Canceled = true;
            popup.Close.click();
        }, null, true);
        sync.Progress = popup.Progress;
        sync.OverallProgress = popup.OverallProgress;
        popup.popUp().reposition();
        sync.games = JSON.parse(GM_getValue(`games`));
        syncBundles(sync, `/bundle-games/search?page=`, 0, function () {
            queueSave(sync.Progress, function () {
                updateGames(sync.games);
                GM_setValue(`LastSave`, 0);
                popup.Icon.classList.remove("fa-refresh");
                popup.Icon.classList.add("fa-check");
                popup.Title.textContent = "Synced!";
                popup.Button.innerHTML = "";
                sync.Progress.innerHTML = sync.OverallProgress.innerHTML = "";
                popup.Close.click();
                GM_setValue("LastBundleSync", new Date().getTime());
                callback();
            });
        });
    }

    function syncBundles(sync, url, nextPage, callback, context) {
        if (context) {
            var matches = context.getElementsByClassName(`table__column__secondary-link`);
            for (var i = 0, n = matches.length; i < n; ++i) {
                var match = matches[i].textContent.match(/(app|sub)\/(\d+)/);
                if (match) {
                    var type = `${match[1]}s`;
                    var id = match[2];
                    if (!sync.games[type][id]) {
                        sync.games[type][id] = {};
                    }
                    sync.games[type][id].bundled = true;
                }
            }
            var paginationNavigation = context.getElementsByClassName(`pagination__navigation`)[0];
            if (paginationNavigation && !paginationNavigation.lastElementChild.classList.contains(`is-selected`)) {
                window.setTimeout(syncBundles, 0, sync, url, nextPage, callback);
            } else {
                callback();
            }
        } else {
            sync.Progress.innerHTML = `
<i class="fa fa-circle-o-notch fa-spin"></i>
<span>Syncing bundles (page ${nextPage})...</span>
`;
            queueRequest(sync, null, `${url}${nextPage}`, function (response) {
                window.setTimeout(syncBundles, 0, sync, url, ++nextPage, callback, DOM.parse(response.responseText));
            });
        }
    }

    function updateGames(games) {
        var key, subKey;
        var saved = JSON.parse(GM_getValue(`games`));
        for (key in games.apps) {
            if (saved.apps[key]) {
                for (subKey in games.apps[key]) {
                    saved.apps[key][subKey] = games.apps[key][subKey];
                }
            } else {
                saved.apps[key] = games.apps[key];
            }
        }
        for (key in games.subs) {
            if (saved.subs[key]) {
                for (subKey in games.subs[key]) {
                    saved.subs[key][subKey] = games.subs[key][subKey];
                }
            } else {
                saved.subs[key] = games.subs[key];
            }
        }
        GM_setValue(`games`, JSON.stringify(saved));
    }

    function formatDate(EntryDate) {
        var Months, Hours, Minutes, OutputDate, Suffix;
        Months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        Hours = EntryDate.getHours();
        Minutes = EntryDate.getMinutes();
        Minutes = (Minutes > 9) ? Minutes : ("0" + Minutes);
        OutputDate = Months[EntryDate.getMonth()] + " " + EntryDate.getDate() + ", " + EntryDate.getFullYear() + " ";
        if (Hours >= 12) {
            if (Hours > 12) {
                Hours -= 12;
            }
            Suffix = "pm";
        } else {
            if (Hours === 0) {
                Hours = 12;
            }
            Suffix = "am";
        }
        OutputDate += Hours + ":" + Minutes + " " + Suffix;
        return OutputDate;
    }

    // Features

    function loadFixedHeader() {
        esgst.header.classList.add(`esgst-fh`);
        var headerSibling;
        if (esgst.featuredContainer && ((esgst.hfc && !esgst.giveawaysPath) || !esgst.hfc)) {
            headerSibling = esgst.featuredContainer;
        } else {
            headerSibling = esgst.pageOuterWrap;
        }
        headerSibling.classList.add(`esgst-fh-sibling`);
        addHeaderStyle();
    }

    function addHeaderStyle() {
        var height = esgst.header.offsetHeight;
        var style = `
.esgst-fh-sibling {
margin-top: ${height}px;
}
`;
        GM_addStyle(style);
        esgst.pageTop += height;
        esgst.commentsTop += height;
    }

    function loadFixedSidebar() {
        esgst.fs = {};
        esgst.fs.sidebarAd = esgst.sidebar.getElementsByClassName(`sidebar__mpu`)[0];
        esgst.fs.sidebarSibling = esgst.sidebar.nextElementSibling;
        document.addEventListener(`scroll`, fixSidebar);
        addSidebarStyle();
        fixSidebar();
    }

    function fixSidebar() {
        esgst.sidebarTop = esgst.sidebar.offsetTop - esgst.pageTop;
        if (window.scrollY > esgst.sidebarTop) {
            document.removeEventListener(`scroll`, fixSidebar);
            toggleFixedSidebar();
            document.addEventListener(`scroll`, unfixSidebar);
        }
    }

    function unfixSidebar() {
        if (window.scrollY <= esgst.sidebarTop) {
            document.removeEventListener(`scroll`, unfixSidebar);
            toggleFixedSidebar();
            document.addEventListener(`scroll`, fixSidebar);
        }
    }

    function toggleFixedSidebar() {
        esgst.sidebar.classList.toggle(`esgst-fs`);
        if (esgst.fs.sidebarAd) {
            esgst.fs.sidebarAd.classList.toggle(`esgst-hidden`);
        }
        esgst.fs.sidebarSibling.classList.toggle(`esgst-fs-sibling`);
    }

    function addSidebarStyle() {
        var style = `
.esgst-fs {
top: ${esgst.pageTop}px;
}
.esgst-fs-sibling {
margin-left: ${esgst.sidebar.offsetWidth + 25}px !important;
}
`;
        GM_addStyle(style);
    }

    function loadFixedMainPageHeading() {
        var html = `
<div class="esgst-fmph-placeholder esgst-hidden"></div>
<div class="${esgst.pageOuterWrapClass} esgst-fmph-background esgst-hidden"></div>
`;
        esgst.mainPageHeading.insertAdjacentHTML(`afterEnd`, html);
        esgst.mainPageHeadingPlaceholder = esgst.mainPageHeading.nextElementSibling;
        esgst.mainPageHeadingBackground = esgst.mainPageHeadingPlaceholder.nextElementSibling;
        document.addEventListener(`scroll`, fixMainPageHeading);
        addMainPageHeadingStyle();
        fixMainPageHeading();
    }

    function fixMainPageHeading() {
        if (window.scrollY > (esgst.mainPageHeading.offsetTop - esgst.pageTop)) {
            document.removeEventListener(`scroll`, fixMainPageHeading);
            toggleFixedMainPageHeading();
            document.addEventListener(`scroll`, unfixMainPageHeading);
        }
    }

    function unfixMainPageHeading() {
        if (window.scrollY <= (esgst.mainPageHeadingPlaceholder.offsetTop - esgst.pageTop)) {
            document.removeEventListener(`scroll`, unfixMainPageHeading);
            toggleFixedMainPageHeading();
            document.addEventListener(`scroll`, fixMainPageHeading);
        }
    }

    function toggleFixedMainPageHeading() {
        esgst.mainPageHeading.classList.toggle(`esgst-fmph`);
        esgst.mainPageHeadingPlaceholder.classList.toggle(`esgst-hidden`);
        esgst.mainPageHeadingBackground.classList.toggle(`esgst-hidden`);
    }

    function addMainPageHeadingStyle() {
        var width = esgst.mainPageHeading.offsetWidth;
        var height = esgst.mainPageHeading.offsetHeight;
        var style = `
.esgst-fmph {
top: ${esgst.pageTop}px;
width: ${width}px;
}

.esgst-fmph-placeholder {
height: ${height}px;
}

.esgst-fmph-background {
height: ${esgst.pageTop + height + 5}px;
width: ${width}px;
}
`;
        GM_addStyle(style);
        esgst.commentsTop += height + 30;
    }

    function loadFixedFooter() {
        esgst.footer.classList.add(`esgst-ff`);
        esgst.pageOuterWrap.classList.add(`esgst-ff-sibling`);
        addFooterStyle();
    }

    function addFooterStyle() {
        var style = `
.esgst-ff-sibling {
margin-bottom: ${esgst.footer.offsetHeight}px;
}
`;
        GM_addStyle(style);
    }

    /* Level Progress Visualizer */

    function loadLpv() {
        if (esgst.sg && !esgst.hr) {
            setLpvStyle();
        }
    }

    function setLpvStyle() {
        var progress, style;
        progress = `${esgst.headerElements.levelContainer.getAttribute(`title`).match(/\.(\d+)/)[1]}%`;
        style = window.getComputedStyle(esgst.headerElements.mainButton.parentElement).backgroundImage;
        esgst.headerElements.mainButton.parentElement.classList.add(`esgst-lpv-container`);
        esgst.headerElements.mainButton.parentElement.setAttribute(`style`, `background-image: linear-gradient(to right, #609f60 ${progress}, transparent ${progress}), ${style};`);
    }

    /* Header Refresher */

    function loadHeaderRefresher() {
        var hr;
        hr = {
            lastRefreshName: `${esgst.name}LastHeaderRefresh`,
            refreshedElementsName: `${esgst.name}RefreshedHeaderElements`,
            refreshLockName: `${esgst.name}HeaderRefreshLock`
        };
        if (esgst.sg) {
            hr.url = `/giveaways/won`;
        } else {
            hr.url = `/`;
        }
        setHrTitle(esgst.headerData.points);
        GM_setValue(hr.refreshedElementsName, JSON.stringify(getHeaderElements()));
        startHeaderRefresher(hr);
        if (!esgst.hr_b) {
            window.addEventListener(`focus`, startHeaderRefresher.bind(null, hr));
            window.addEventListener(`blur`, stopHeaderRefresher.bind(null, hr));
        }
        if (typeof GM_addValueChangeListener !== `undefined`) {
            GM_addValueChangeListener(hr.refreshedElementsName, refreshHeader.bind(null, hr));
        }
    }

    function refreshHeaderElements(context) {
        var deliveredWins, i, match, matches, n, navigation, notReceived, received;
        esgst.headerElements = {};
        esgst.headerData = {};
        navigation = context.querySelector(`.nav__right-container, .header_inner_wrap nav`);
        esgst.headerElements.mainButton = navigation.querySelector(`.nav__button--is-dropdown, .nav_btn[href^="/user/"]`);
        if (esgst.sg) {
            esgst.headerElements.pointsContainer = esgst.headerElements.mainButton.firstElementChild;
            esgst.headerData.points = parseInt(esgst.headerElements.pointsContainer.textContent.match(/\d+/)[0]);
            esgst.headerElements.levelContainer = esgst.headerElements.mainButton.lastElementChild;
            esgst.headerData.level = parseInt(esgst.headerElements.levelContainer.textContent.match(/\d+/)[0]);
            esgst.headerElements.createdButton = navigation.getElementsByClassName(`fa-gift`)[0].closest(`.nav__button-container`);
            esgst.headerElements.wonButton = navigation.getElementsByClassName(`fa-trophy`)[0].closest(`.nav__button-container`);
            if (esgst.dgn) {
                deliveredWins = 0;
                matches = context.getElementsByClassName(`table__row-inner-wrap`);
                for (i = 0, n = matches.length; i < n; ++i) {
                    match = matches[i];
                    received = match.getElementsByClassName(`table__gift-feedback-received`)[0];
                    notReceived = match.getElementsByClassName(`table__gift-feedback-not-received`)[0];
                    if (((received && received.classList.contains(`is-hidden`)) && ((notReceived && notReceived.classList.contains(`is-hidden`)) || !notReceived)) && match.querySelector(`[data-clipboard-text]`)) {
                        ++deliveredWins;
                    }
                }
                if (deliveredWins > 0) {
                    esgst.headerElements.wonButton.classList.add(`esgst-hr-delivered`);
                    esgst.headerElements.wonButton.firstElementChild.title = `Giveaways Won (${deliveredWins} Delivered)`;
                }
                deliveredWins = esgst.headerElements.wonButton.firstElementChild.title.match(/\d+/);
                esgst.headerData.deliveredWins = deliveredWins ? parseInt(deliveredWins[0]) : 0;
            }
        }
        esgst.headerElements.inboxButton = navigation.getElementsByClassName(`fa-envelope`)[0].closest(`.nav__button-container, .nav_btn_container`);
        esgst.headerElements.messageCountContainer = esgst.headerElements.inboxButton.querySelector(`.nav__notification, .message_count`);
        esgst.headerData.messageCount = esgst.headerElements.messageCountContainer ? esgst.headerElements.messageCountContainer.textContent : ``;
    }

    function getHeaderElements() {
        var elements;
        elements = {
            mainButton: esgst.headerElements.mainButton.outerHTML,
            inboxButton: esgst.headerElements.inboxButton.outerHTML
        };
        if (esgst.sg) {
            elements.createdButton = esgst.headerElements.createdButton.outerHTML;
            elements.wonButton = esgst.headerElements.wonButton.outerHTML;
        }
        return elements;
    }

    function startHeaderRefresher(hr) {
        request(null, false, hr.url, function(response) {
            refreshHeaderElements(DOM.parse(response.responseText));
            GM_setValue(hr.refreshedElementsName, JSON.stringify(getHeaderElements()));
            refreshHeader(hr);
            createLock(hr.refreshLockName, 60000, function () {
                hr.refresher = window.setInterval(function () {
                    request(null, false, hr.url, function(response) {
                        refreshHeaderElements(DOM.parse(response.responseText));
                        GM_setValue(hr.refreshedElementsName, JSON.stringify(getHeaderElements()));
                    });
                }, 60000);
            });
        });
    }

    function stopHeaderRefresher(hr) {
        clearInterval(hr.refresher);
    }

    function refreshHeader(hr) {
        var elements, points;
        refreshHeaderElements(document);
        points = esgst.headerData.points;
        elements = JSON.parse(GM_getValue(hr.refreshedElementsName));
        esgst.headerElements.mainButton.outerHTML = elements.mainButton;
        if (esgst.sg) {
            esgst.headerElements.createdButton.outerHTML = elements.createdButton;
            esgst.headerElements.wonButton.outerHTML = elements.wonButton;
        }
        esgst.headerElements.inboxButton.outerHTML = elements.inboxButton;
        refreshHeaderElements(document);
        if (esgst.hr) {
            setHrTitle(points);
        }
        if (esgst.sg && esgst.lpv) {
            setLpvStyle();
        }
    }

    function setHrTitle(points) {
        var title;
        title = ``;
        if (esgst.sg) {
            if (esgst.headerData.deliveredWins > 0) {
                title += `(${esgst.headerData.deliveredWins}W) `;
            }
        }
        if (esgst.headerData.messageCount) {
            if (esgst.hr_i) {
                title += `🔥 `;
            }
            title += `(${esgst.headerData.messageCount}M) `;
        }
        if (esgst.sg) {
            if (esgst.headerData.points !== points) {
                updateElgbButtons(esgst.headerData.points);
            }
            if (esgst.hr_p) {
                title += `(${esgst.headerData.points}P) `;
            }
        }
        title += esgst.originalTitle;
        if (document.title !== title) {
            document.title = title;
        }
    }

    /* */

    function loadHiddenBlacklistStats() {
        var Chart, Match, Points, N, Data, I, CountDate, Year, Month, Day, Count, Context;
        Chart = document.getElementsByClassName("chart")[4];
        Match = Chart.previousElementSibling.textContent.match(/"Whitelists", data: \[(.+)\]},/)[1];
        Points = Match.split(/\],\[/);
        N = Points.length - 1;
        Points[0] = Points[0].replace(/^\[/, "");
        Points[N] = Points[N].replace(/\/]$/, "");
        Data = [];
        for (I = 0; I <= N; ++I) {
            Match = Points[I].match(/(.+), (.+)/);
            CountDate = Match[1].match(/\((.+?),(.+?),(.+?)\)/);
            Year = parseInt(CountDate[1]);
            Month = parseInt(CountDate[2]);
            Day = parseInt(CountDate[3]);
            Count = parseInt(Match[2]);
            Data.push([Date.UTC(Year, Month, Day), Count]);
        }
        Context = Chart.firstElementChild;
        Context.lastElementChild.remove();
        Context.lastElementChild.remove();
        Context = Context.nextElementSibling;
        Context.textContent = Context.textContent.replace(/and blacklists\s/, "");
        Context = Context.nextElementSibling;
        $(function () {
            chart_options.graph = {
                colors: ["#6187d4", "#ec656c"],
                tooltip: {
                    headerFormat: "<p class=\"chart__tooltip-header\">{point.key}</p>",
                    pointFormat: "<p class=\"chart__tooltip-point\" style=\"color: {point.color};\">{point.y:,.0f} {series.name}</p>"
                },
                series: [{
                    name: "Whitelists",
                    data: Data
                }]
            };
            $(Context).highcharts(Highcharts.merge(chart_options.default, chart_options.areaspline, chart_options.datetime, chart_options.graph));
        });
    }

    /* [DGN] Delivered Gifts Notifier */

    function loadDeliveredGiftsNotifier() {
        if (esgst.sg && !esgst.hr) {
            request(null, false, `/giveaways/won`, getDeliveredGifts);
        }
    }

    function getDeliveredGifts(response) {
        refreshHeaderElements(DOM.parse(response.responseText));
        GM_setValue(`sgRefreshedHeaderElements`, JSON.stringify(getHeaderElements()));
        refreshHeader({
            refreshedElementsName: `sgRefreshedHeaderElements`
        });
    }

    /* [VAI] Visible Attached Images */

    function loadVisibleAttachedImages() {
        getImages(document);
        esgst.endlessFeatures.push(getImages);
    }

    function getImages(context) {
        var images, i, n, image, url;
        images = context.querySelectorAll(`.comment__toggle-attached ~ a img, .view_attached ~ a img`);
        for (i = 0, n = images.length; i < n; ++i) {
            image = images[i];
            url = image.getAttribute(`src`);
            if (url) {
                // rename .gifv images to .gif so that they can be attached properly
                url = url.replace(/\.gifv/, `.gif`);
                image.setAttribute(`src`, url);
            }
            image.classList.remove(`is_hidden`, `is-hidden`);
        }
    }

    /* [EV] Embedded Videos */

    function loadEmbeddedVideos() {
        getVideos(document);
        esgst.endlessFeatures.push(getVideos);
    }

    function getVideos(context) {
        var types, i, numTypes, type, videos, j, numVideos, video, previous, next, embedUrl, url, text, title;
        types = [`youtube.com`, `youtu.be`, `vimeo.com`];
        for (i = 0, numTypes = types.length; i < numTypes; ++i) {
            type = types[i];
            videos = context.querySelectorAll(`a[href*="${type}"]`);
            for (j = 0, numVideos = videos.length; j < numVideos; ++j) {
                video = videos[j];
                previous = video.previousSibling;
                next = video.nextSibling;
                if ((!previous || !previous.textContent.trim()) && (!next || !next.textContent.trim())) {
                    // video is the only content in the line
                    url = video.getAttribute(`href`);
                    embedUrl = getVideoEmbedUrl(i, url);
                    if (embedUrl) {
                        text = video.textContent;
                        if (url !== text) {
                            title = `<div>${text}</div>`;
                        } else {
                            title = ``;
                        }
                        video.outerHTML = `
<div>
${title}
<iframe width="640" height="360" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
</div>
`;
                    }
                }
            }
        }
    }

    function getVideoEmbedUrl(i, url) {
        var regExps, regExp, match, baseUrls, baseUrl, code;
        regExps = [
            /youtube.com\/watch\?v=(.+?)(\/.*)?(&.*)?$/,
            /youtu.be\/(.+?)(\/.*)?$/,
            /vimeo.com\/(.+?)(\/.*)?$/
        ];
        regExp = regExps[i];
        match = url.match(regExp);
        if (match) {
            baseUrls = [
                `https://www.youtube.com/embed/`,
                `https://www.youtube.com/embed/`,
                `https://player.vimeo.com/video/`
            ];
            baseUrl = baseUrls[i];
            code = match[1];
            return `${baseUrl}${code}`;
        } else {
            return null;
        }
    }

    /* [AT] Accurate Timestamps */

    function loadAccurateTimestamps() {
        if ((esgst.at_g && esgst.giveawaysPath) || !esgst.giveawaysPath) {
            getTimestamps(document);
            esgst.endlessFeatures.push(getTimestamps);
        }
    }

    function getTimestamps(context) {
        var timestamps, i, n, timestamp, text, edited, seconds, accurateTimestamp;
        timestamps = context.querySelectorAll(`[data-timestamp]`);
        for (i = 0, n = timestamps.length; i < n; ++i) {
            timestamp = timestamps[i];
            text = timestamp.textContent;
            edited = text.match(/\*/);
            seconds = parseInt(timestamp.getAttribute(`data-timestamp`));
            accurateTimestamp = getTimestamp(seconds, esgst.at_c24, esgst.at_s);
            if (edited) {
                text = ` (Edited ${accurateTimestamp})`;
            } else {
                text = `${accurateTimestamp} - ${text}`;
            }
            timestamp.textContent = text;
        }
    }

    /* Pagination Navigation On Top */

    function loadPaginationNavigationOnTop() {
        if (esgst.paginationNavigation && esgst.mainPageHeading) {
            esgst.paginationNavigation.classList.add(`page_heading_btn`);
            esgst.mainPageHeading.appendChild(esgst.paginationNavigation);
        }
    }

    function loadEndlessScrolling() {
        var pagination, context, currentPage, nextPage, reversePages,
            esPageHeading,
            mainPaginationNavigationBackup,
            esRefreshButton, esPauseButton;
        pagination = esgst.pagination;
        context = pagination.previousElementSibling;
        if (esgst.paginationNavigation) {
            if (esgst.es_rs && esgst.discussionPath) {
                if (esgst.currentPage == 1) {
                    pagination.classList.add(`esgst-hidden`);
                    context.classList.add(`esgst-hidden`);
                    currentPage = parseInt(esgst.paginationNavigation.lastElementChild.getAttribute(`data-page-number`));
                    nextPage = currentPage;
                    reversePages = true;
                    activateEndlessScrolling();
                } else {
                    reverseComments(context);
                    currentPage = esgst.currentPage;
                    nextPage = currentPage - 1;
                    reversePages = false;
                    activateEndlessScrolling();
                }
            } else if (!esgst.paginationNavigation.lastElementChild.classList.contains(esgst.selectedClass)) {
                currentPage = esgst.currentPage;
                nextPage = currentPage + 1;
                activateEndlessScrolling();
            }
        } else if (esgst.es_rs && esgst.discussionPath) {
            reverseComments(context);
        }

        function activateEndlessScrolling() {
            var html;
            if (!esgst.fmph) {
                loadFixedMainPageHeading();
            }
            if (!esgst.pnot) {
                loadPaginationNavigationOnTop();
            }
            esgst.mainPageHeadingPlaceholder.id = `esgst-es-page-${currentPage}`;
            mainPaginationNavigationBackup = esgst.paginationNavigation.innerHTML;
            if (!reversePages) {
                document.addEventListener(`scroll`, restoreMainPaginationNavigation);
            }
            html = `
<div class="page_heading_btn esgst-es-refresh-button" title="Refresh the current page">
<i class="fa fa-refresh"></i>
</div>
<div class="page_heading_btn esgst-es-pause-button" title="Pause the endless scrolling">
<i class="fa fa-pause"></i>
</div>
`;
            esgst.mainPageHeading.insertAdjacentHTML(`beforeEnd`, html);
            esPauseButton = esgst.mainPageHeading.lastElementChild;
            esRefreshButton = esPauseButton.previousElementSibling;
            esRefreshButton.addEventListener(`click`, refreshPage);
            esPauseButton.addEventListener(`click`, pauseEndlessScrolling);
            setEsPaginationNavigation();
            document.addEventListener(`scroll`, loadNextPage);
            loadNextPage();
        }

        function loadNextPage() {
            var html;
            if (window.scrollY >= (document.body.offsetHeight - (window.innerHeight * 2))) {
                document.removeEventListener(`scroll`, loadNextPage);
                if (reversePages) {
                    html = `
<div>
<i class="fa fa-circle-o-notch fa-spin"></i>
<span>Reversing pages...</span>
</div>
`;
                    esgst.mainPageHeading.insertAdjacentHTML(`afterBegin`, html);
                    esPageHeading = esgst.mainPageHeading.firstElementChild;
                } else {
                    html = `
<div class="${esgst.pageHeadingClass} esgst-es-page-heading">
<div class="${esgst.pageHeadingBreadcrumbsClass}">
<i class="fa fa-circle-o-notch fa-spin"></i>
<span>Loading next page...</span>
</div>
</div>
`;
                    pagination.insertAdjacentHTML(`afterEnd`, html);
                    esPageHeading = pagination.nextElementSibling;
                }
                makeRequest(null, `${esgst.searchUrl}${nextPage}`, null, setNextPage);
            }
        }

        function setNextPage(response) {
            var responseHtml, previousPaginationBackup, paginationNavigation, paginationNavigationBackup,
                paginationBackup, parent;
            responseHtml = DOM.parse(response.responseText);
            previousPaginationBackup = pagination;
            pagination = responseHtml.getElementsByClassName(`pagination`)[0];
            context = pagination.previousElementSibling;
            paginationNavigation = pagination.getElementsByClassName(esgst.paginationNavigationClass)[0];
            paginationNavigationBackup = paginationNavigation.innerHTML;
            paginationBackup = pagination;
            if (reversePages) {
                esPageHeading.remove();
                esPageHeading = esgst.pagination;
                esgst.paginationNavigation.innerHTML = paginationNavigationBackup;
                setEsPaginationNavigation();
                reversePages = false;
            } else {
                esPageHeading.firstElementChild.innerHTML = `
<a href="${esgst.searchUrl}${nextPage}">Page ${nextPage}</a>
`;
                esPageHeading.id = `esgst-es-page-${nextPage}`;
            }
            parent = esPageHeading.parentElement;
            parent.insertBefore(context, esPageHeading.nextElementSibling);
            parent.insertBefore(pagination, context.nextElementSibling);
            loadEndlessFeatures(context);
            setESHide(context);
            setESRemoveEntry(context);
            if (esgst.es_rs && esgst.discussionPath) {
                reverseComments(context);
                --nextPage;
                if (nextPage > 0) {
                    document.addEventListener(`scroll`, loadNextPage);
                    loadNextPage();
                }
            } else {
                ++nextPage;
                if (!paginationNavigation.lastElementChild.classList.contains(esgst.selectedClass)) {
                    document.addEventListener(`scroll`, loadNextPage);
                    loadNextPage();
                }
            }
            paginationNavigation.remove();
            document.addEventListener(`scroll`, changePaginationNavigation);

            function changePaginationNavigation() {
                var pageTop, pageBottom;
                pageTop = previousPaginationBackup.offsetTop - esgst.pageTop;
                pageBottom = paginationBackup.offsetTop;
                if ((window.scrollY >= pageTop) && (window.scrollY <= pageBottom)) {
                    if (esgst.paginationNavigation.innerHTML != paginationNavigationBackup) {
                        esgst.paginationNavigation.innerHTML = paginationNavigationBackup;
                        setEsPaginationNavigation();
                    }
                }
            }
        }

        function restoreMainPaginationNavigation() {
            var mainPageBottom;
            mainPageBottom = esgst.pagination.offsetTop;
            if ((window.scrollY >= 0) && (window.scrollY <= mainPageBottom)) {
                if (esgst.paginationNavigation.innerHTML != mainPaginationNavigationBackup) {
                    esgst.paginationNavigation.innerHTML = mainPaginationNavigationBackup;
                    setEsPaginationNavigation();
                }
            }
        }

        function refreshPage() {
            var page;
            esRefreshButton.removeEventListener(`click`, refreshPage);
            esRefreshButton.innerHTML = `
<i class="fa fa-circle-o-notch fa-spin"></i>
`;
            page = window.location.href.match(/page=(\d+)/);
            if (page) {
                page = page[1];
            } else {
                page = 1;
            }
            makeRequest(null, window.location.href, null, setRefreshedPage);

            function setRefreshedPage(response) {
                var responseHtml, newContext, element, parent;
                responseHtml = DOM.parse(response.responseText);
                newContext = responseHtml.getElementsByClassName(`pagination`)[0].previousElementSibling;
                loadEndlessFeatures(newContext);
                setESHide(newContext);
                setESRemoveEntry(newContext);
                if (esgst.es_rs && esgst.discussionPath) {
                    reverseComments(newContext);
                }
                element = document.getElementById(`esgst-es-page-${page}`);
                if (element.classList.contains(`esgst-fmph-placeholder`)) {
                    element = esgst.pagination.previousElementSibling.previousElementSibling;
                }
                if (esgst.gf.filtered) {
                    var hidden = element.nextElementSibling.getElementsByClassName(`giveaway__row-outer-wrap esgst-hidden`).length;
                    esgst.gf.filtered.textContent = parseInt(esgst.gf.filtered.textContent) - hidden;
                }
                element.nextElementSibling.remove();
                parent = element.parentElement;
                parent.insertBefore(newContext, element.nextElementSibling);
                esRefreshButton.innerHTML = `
<i class="fa fa-refresh"></i>
`;
                esRefreshButton.addEventListener(`click`, refreshPage);
            }
        }

        function pauseEndlessScrolling() {
            document.removeEventListener(`scroll`, loadNextPage);
            esPauseButton.removeEventListener(`click`, pauseEndlessScrolling);
            esPauseButton.title = `Resume the endless scrolling.`;
            esPauseButton.innerHTML = `
<i class="fa fa-play"></i>
`;
            esPauseButton.addEventListener(`click`, resumeEndlessScrolling);
        }

        function resumeEndlessScrolling() {
            esPauseButton.removeEventListener(`click`, resumeEndlessScrolling);
            esPauseButton.title = `Pause the endless scrolling.`;
            esPauseButton.innerHTML = `
<i class="fa fa-pause"></i>
`;
            esPauseButton.addEventListener(`click`, pauseEndlessScrolling);
            document.addEventListener(`scroll`, loadNextPage);
            loadNextPage();
        }
    }

    function reverseComments(context) {
        var i, n;
        var frag = document.createDocumentFragment();
        for (i = 0, n = context.children.length; i < n; ++i) {
            frag.appendChild(context.lastElementChild);
        }
        context.appendChild(frag);
    }

    function setEsPaginationNavigation() {
        var matches, i, n;
        matches = esgst.paginationNavigation.children;
        for (i = 0, n = matches.length; i < n; ++i) {
            matches[i].addEventListener(`click`, setEsPaginationNavigationItem);
        }
    }

    function setEsPaginationNavigationItem(event) {
        var page, id;
        event.preventDefault();
        page = event.currentTarget.getAttribute(`data-page-number`);
        id = `esgst-es-page-${page}`;
        if (document.getElementById(id)) {
            window.location.hash = id;
        } else {
            window.location.href = event.currentTarget.getAttribute(`href`);
        }
    }

    function setESHide(Context) {
        var Matches, I, N;
        Matches = Context.getElementsByClassName("giveaway__hide trigger-popup");
        for (I = 0, N = Matches.length; I < N; ++I) {
            Matches[I].addEventListener("click", function (Event) {
                var Popup, Giveaway;
                Popup = document.getElementsByClassName("popup--hide-games")[0];
                Giveaway = Event.currentTarget.closest(".giveaway__row-outer-wrap");
                Popup.querySelector("[name=game_id]").value = Giveaway.getAttribute("data-game-id");
                Popup.getElementsByClassName("popup__heading__bold")[0].textContent = Giveaway.getElementsByClassName("giveaway__heading__name")[0].textContent;
                $(Popup).bPopup().close();
                $(Popup).bPopup({
                    amsl: [0],
                    fadeSpeed: 200,
                    followSpeed: 500,
                    modalColor: "#3c424d",
                    opacity: 0.85
                });
            });
        }
    }

    function setESRemoveEntry(Context) {
        var Matches, I, N;
        Matches = Context.getElementsByClassName("table__row-inner-wrap");
        for (I = 0, N = Matches.length; I < N; ++I) {
            removeESEntry(Matches[I]);
        }
    }

    function removeESEntry(Context) {
        var Default, Loading, Complete, Data;
        Default = Context.getElementsByClassName("table__remove-default")[0];
        if (Default) {
            Loading = Default.nextElementSibling;
            Complete = Loading.nextElementSibling;
            Default.addEventListener("click", function () {
                var Values, I, N;
                Default.classList.toggle("is-hidden");
                Loading.classList.toggle("is-hidden");
                Values = Context.getElementsByTagName("input");
                Data = "";
                for (I = 0, N = Values.length; I < N; ++I) {
                    Data += Values[I].getAttribute("name") + "=" + Values[I].value + ((I < (N - 1)) ? "&" : "");
                }
                makeRequest(Data, "/ajax.php", null, function (Response) {
                    Loading.classList.toggle("is-hidden");
                    if (JSON.parse(Response.responseText).type == "success") {
                        Context.classList.add("is-faded");
                        Complete.classList.toggle("is-hidden");
                    } else {
                        Default.classList.toggle("is-hidden");
                    }
                });
            });
        }
    }

    function loadEndlessFeatures(Context) {
        getUsersGames(Context);
        for (var i = 0, n = esgst.endlessFeatures.length; i < n; ++i) {
            esgst.endlessFeatures[i](Context);
        }
    }

    function loadHiddenFeaturedContainer() {
        esgst.featuredContainer.classList.add(`esgst-hidden`);
    }

    function loadAdvancedGiveawaySearch() {
        var Context, Input, Match, AGSPanel, AGS, Level, I, RegionRestricted;
        Context = document.getElementsByClassName("sidebar__search-container")[0];
        Context.firstElementChild.remove();
        Context.insertAdjacentHTML("afterBegin", "<input class=\"sidebar__search-input\" placeholder=\"Search...\" type=\"text\"/>");
        Input = Context.firstElementChild;
        Match = window.location.href.match(/q=(.*?)(&.+?)?$/);
        if (Match) {
            Input.value = Match[1];
        }
        Context.insertAdjacentHTML("afterEnd", "<div class=\"AGSPanel\"></div>");
        AGSPanel = Context.nextElementSibling;
        AGS = {};
        Level = "<select>";
        for (I = 0; I <= 10; ++I) {
            Level += "<option>" + I + "</option>";
        }
        Level += "</select>";
        createAGSFilters(AGSPanel, AGS, [{
            Title: "Level",
            HTML: Level,
            Key: "level",
        }, {
            Title: "Entries",
            HTML: "<input type=\"text\"/>",
            Key: "entry",
        }, {
            Title: "Copies",
            HTML: "<input type=\"text\"/>",
            Key: "copy"
        }]);
        AGS.level_max.selectedIndex = 10;
        AGSPanel.insertAdjacentHTML(
            "beforeEnd",
            "<div>" +
            "    <span></span>" +
            "    <span>Region Restricted</span>" +
            "</div>" +
            "<div>" +
            "    <span></span>" +
            "    <span>DLC</span>" +
            "</div>"
        );
        var dlc = AGSPanel.lastElementChild;
        var regionRestricted = dlc.previousElementSibling;
        RegionRestricted = createCheckbox(regionRestricted.firstElementChild).Checkbox;
        var DLC = createCheckbox(dlc.firstElementChild).Checkbox;
        Context.addEventListener("keydown", function (Event) {
            var Type, URL, Key;
            if (Event.key == "Enter") {
                Event.preventDefault();
                Type = window.location.href.match(/(type=(.+?))(&.+?)?$/);
                URL = "https://www.steamgifts.com/giveaways/search?q=" + Input.value + (Type ? ("&" + Type[1]) : "");
                for (Key in AGS) {
                    if (AGS[Key].value) {
                        URL += "&" + Key + "=" + AGS[Key].value;
                    }
                }
                URL += RegionRestricted.checked ? "&region_restricted=true" : "";
                URL += DLC.checked ? "&dlc=true" : "";
                window.location.href = URL;
            }
        });
    }

    function createAGSFilters(AGSPanel, AGS, Filters) {
        var I, N, AGSFilter;
        for (I = 0, N = Filters.length; I < N; ++I) {
            AGSPanel.insertAdjacentHTML(
                "beforeEnd",
                "<div class=\"AGSFilter\">" +
                "    <span>Min " + Filters[I].Title + " " + Filters[I].HTML + "</span>" +
                "    <span>Max " + Filters[I].Title + " " + Filters[I].HTML + "</span>" +
                "</div>"
            );
            AGSFilter = AGSPanel.lastElementChild;
            AGS[Filters[I].Key + "_min"] = AGSFilter.firstElementChild.firstElementChild;
            AGS[Filters[I].Key + "_max"] = AGSFilter.lastElementChild.firstElementChild;
        }
    }

    function loadGridView(context) {
        var matches = context.getElementsByClassName(`giveaway__row-outer-wrap`);
        for (var i = 0, n = matches.length; i < n; ++i) {
            setGVContainer(matches[i]);
        }
    }

    function setGVContainer(Context) {
        var GVBox, GVInfo, Columns, GVIcons, Element;
        Context.parentElement.classList.add("GVView");
        Context.classList.add("GVContainer");
        GVBox = Context.getElementsByClassName("giveaway__row-inner-wrap")[0];
        GVBox.classList.add("GVBox");
        GVBox.insertAdjacentHTML("afterBegin", "<div class=\"global__image-outer-wrap GVInfo rhHidden\"></div>");
        GVInfo = GVBox.firstElementChild;
        do {
            Element = GVInfo.nextElementSibling;
            if (Element) {
                GVInfo.appendChild(Element);
            }
        } while (Element);
        GVBox.insertBefore(Context.getElementsByClassName("global__image-outer-wrap--game-medium")[0], GVInfo);
        Columns = Context.getElementsByClassName("giveaway__columns")[0];
        Context.insertAdjacentHTML("afterBegin", "<div class=\"GVIcons giveaway__columns\"></div>");
        GVIcons = Context.firstElementChild;
        while (!Columns.lastElementChild.classList.contains("giveaway__column--width-fill")) {
            Element = Columns.lastElementChild;
            if (Element.textContent.match(/Level/)) {
                Element.textContent = Element.textContent.replace(/Level\s/, "");
            }
            GVIcons.appendChild(Element);
        }
        GVBox.addEventListener("mouseenter", function () {
            GVInfo.classList.remove("rhHidden");
            GVInfo.removeAttribute("style");
            repositionPopout(GVInfo, GVBox);
        });
        GVBox.addEventListener("mouseleave", function () {
            GVInfo.classList.add("rhHidden");
        });
    }

    function loadPinnedGiveawaysButton() {
        var PGBContainer, HTML, PGBIcon;
        PGBContainer = esgst.pinnedGiveawaysButton.previousElementSibling;
        PGBContainer.classList.add("PGBContainer");
        esgst.pinnedGiveawaysButton.remove();
        HTML = `
<div class="PGBButton pinned-giveaways__button">
<i class="PGBIcon fa fa-angle-down"></i>
</div>
`;
        PGBContainer.insertAdjacentHTML("afterEnd", HTML);
        esgst.pinnedGiveawaysButton = PGBContainer.nextElementSibling;
        PGBIcon = esgst.pinnedGiveawaysButton.firstElementChild;

        function togglePGBButton() {
            PGBContainer.classList.toggle("pinned-giveaways__inner-wrap--minimized");
            PGBIcon.classList.toggle("fa-angle-down");
            PGBIcon.classList.toggle("fa-angle-up");
        }

        esgst.pinnedGiveawaysButton.addEventListener("click", togglePGBButton);
    }

    /* One-Click Hide Giveaway Button */

    function loadOchgb() {
        if (esgst.sg) {
            esgst.giveawayFeatures.push(setOchgbButtons);
        }
    }

    function setOchgbButtons(giveaways) {
        var i, n;
        for (i = 0, n = giveaways.length; i < n; ++i) {
            setOchgbButton(giveaways[i]);
        }
    }

    function setOchgbButton(giveaway) {
        var button, i, matches, n, newButton;
        button = giveaway.innerWrap.querySelector(`.giveaway__hide, .featured__giveaway__hide`);
        if (button) {
            if (esgst.giveawayPath) {
                button = button.parentElement;
            }
            newButton = insertHtml(button, `afterEnd`, `<a><i class="${esgst.giveawayPath ? `` : `giveaway__icon`} fa fa-eye-slash"></i></a>`);
            button.remove();
            newButton.addEventListener(`click`, function() {
                newButton.firstElementChild.className = `giveaway__icon fa fa-circle-o-notch fa-spin`;
                request(`xsrf_token=${esgst.xsrfToken}&do=hide_giveaways_by_game_id&game_id=${giveaway.gameId}`, false, `/ajax.php`, function() {
                    newButton.remove();
                    if (!esgst.giveawayPath) {
                        giveaway.outerWrap.remove();
                        matches = document.querySelectorAll(`.giveaway__row-outer-wrap[data-game-id="${giveaway.gameId}"]`);
                        for (i = 0, n = matches.length; i < n; ++i) {
                            matches[i].remove();
                        }
                    }
                });
            });
        }
    }

    /* Giveaway Groups Loader */

    function loadGgl() {
        if (esgst.sg) {
            if (esgst.ggl_p) {
                esgst.giveawayFeatures.push(setGglButtons);
            } else {
                esgst.giveawayFeatures.push(getGglGiveaways);
            }
        }
    }

    function setGglButtons(giveaways) {
        var i, n;
        for (i = 0, n = giveaways.length; i < n; ++i) {
            setGglButton(giveaways[i]);
        }
    }

    function setGglButton(giveaway) {
        if (giveaway.group) {
            giveaway.group.classList.add(`esgst-ggl-button`);
            giveaway.group.removeAttribute(`href`);
            giveaway.group.addEventListener(`click`, function() {
                var panel, popup, progress, savedGroups;
                popup = createPopup_v6(`fa-user`, `<a href="${giveaway.url}/groups">Giveaway Groups</a>`, true);
                progress = insertHtml(popup.description, `beforeEnd`,  `
                    <div>
                        <i class="fa fa-circle-o-notch fa-spin"></i>
                        <span>Loading groups...</span>
                    </div>
                `);
                panel = insertHtml(popup.description, `beforeEnd`, `<div class="popup__keys__list"></div>`);
                popup.open();
                savedGroups = GM_getValue(`Groups`);
                loadGglGroups([giveaway], 0, 1, JSON.parse(GM_getValue(`giveaways`, `{}`)), savedGroups, function(groups) {
                    var className, groupCount, i, n, key, link;
                    if (groups) {
                        groupCount = 0;
                        for (key in groups) {
                            for (i = 0, n = savedGroups.length; i < n && savedGroups[i].Code !== key; ++i);
                            if (i < n) {
                                className = `esgst-ggl-member`;
                                groupCount += 1;
                            } else if (esgst.ggl_m) {
                                className = `esgst-hidden`;
                            } else {
                                className = ``;
                                groupCount += 1;
                            }
                            if (className !== `esgst-hidden`) {
                                link = insertHtml(panel, `beforeEnd`, `
                                    <div class="${className}">
                                        <a href="/group/${key}/"></a>
                                    </div>
                                `).firstElementChild;
                                link.textContent = groups[key];
                            }
                        }
                        if (groupCount === 0) {
                            progress.innerHTML = `
                                <i class="fa fa-exclamation-mark"></i>
                                <span>You are not a member of any group in this giveaway.</span>
                            `;
                        } else {
                            progress.remove();
                        }
                    } else {
                        progress.innerHTML = `
                            <i class="fa fa-times-circle"></i>
                            <span>An error ocurred.</span>
                        `;
                    }
                });
            });
        }
    }

    function getGglGiveaways(giveaways) {
        var savedGiveaways, savedGroups;
        savedGiveaways = JSON.parse(GM_getValue(`giveaways`, `{}`));
        savedGroups = GM_getValue(`Groups`);
        loadGglGroups(giveaways, 0, giveaways.length, savedGiveaways, savedGroups);
    }

    function loadGglGroups(giveaways, i, n, savedGiveaways, savedGroups, callback) {
        var giveaway;
        if (i < n) {
            giveaway = giveaways[i];
            if (giveaway.group) {
                if (savedGiveaways[giveaway.code] && savedGiveaways[giveaway.code].groups && Object.keys(savedGiveaways[giveaway.code].groups).length) {
                    if (callback) {
                        callback(savedGiveaways[giveaway.code].groups);
                    } else {
                        addGglPanel(giveaway, savedGiveaways[giveaway.code].groups, savedGroups);
                    }
                    window.setTimeout(loadGglGroups, 0, giveaways, ++i, n, savedGiveaways, savedGroups);
                } else {
                    getGglGroups({}, 1, `${giveaway.url}/groups/search?page=`, function(groups) {
                        if (groups) {
                            createLock(`giveawayLock`, 300, function(deleteLock) {
                                savedGiveaways = JSON.parse(GM_getValue(`giveaways`, `{}`));
                                if (!savedGiveaways[giveaway.code]) {
                                    savedGiveaways[giveaway.code] = {};
                                }
                                savedGiveaways[giveaway.code].groups = groups;
                                GM_setValue(`giveaways`, JSON.stringify(savedGiveaways));
                                deleteLock();
                                if (callback) {
                                    callback(savedGiveaways[giveaway.code].groups);
                                } else {
                                    addGglPanel(giveaway, groups, savedGroups);
                                }
                                window.setTimeout(loadGglGroups, 0, giveaways, ++i, n, savedGiveaways, savedGroups);
                            });
                        } else if (callback) {
                            callback(null);
                        } else {
                            window.setTimeout(loadGglGroups, 0, giveaways, ++i, n, savedGiveaways, savedGroups);
                        }
                    });
                }
            } else {
                window.setTimeout(loadGglGroups, 0, giveaways, ++i, n, savedGiveaways, savedGroups);
            }
        } else if (callback) {
            callback(null);
        }
    }

    function addGglPanel(giveaway, groups, savedGroups) {
        var className, groupCount, i, key, link, n, panel;
        if (!giveaway.summary.getElementsByClassName(`esgst-ggl-panel`)[0]) {
            panel = insertHtml(giveaway.summary, `beforeEnd`, `
                <div class="popup__actions esgst-ggl-panel">
                    <i class="fa fa-user"></i>
                </div>
            `);
            groupCount = 0;
            for (key in groups) {
                for (i = 0, n = savedGroups.length; i < n && savedGroups[i].Code !== key; ++i);
                if (i < n) {
                    className = `esgst-ggl-member`;
                    groupCount += 1;
                } else if (esgst.ggl_m) {
                    className = `esgst-hidden`;
                } else {
                    className = ``;
                    groupCount += 1;
                }
                if (className !== `esgst-hidden`) {
                    link = insertHtml(panel, `beforeEnd`, `<a class="${className}" href="/group/${key}/"></a>`);
                    link.textContent = groups[key];
                }
            }
            if (groupCount === 0) {
                panel.remove();
            }
        }
    }

    function getGglGroups(groups, nextPage, url, callback) {
        request(null, false, `${url}${nextPage}`, function(response) {
            var code, error, i, matches, n, name, pagination, responseHtml;
            responseHtml = DOM.parse(response.responseText);
            error = responseHtml.getElementsByClassName(`table--summary`)[0];
            if (error) {
                window.setTimeout(callback, 0, null);
            } else {
                matches = responseHtml.getElementsByClassName(`table__column__heading`);
                for (i = 0, n = matches.length; i < n; ++i) {
                    url = matches[i].getAttribute(`href`);
                    code = url.match(/\/group\/(.+?)\//)[1];
                    name = matches[i].textContent;
                    groups[code] = name;
                }
                pagination = responseHtml.getElementsByClassName(`pagination__navigation`)[0];
                if (pagination && !pagination.lastElementChild.classList.contains(`is-selected`)) {
                    window.setTimeout(getGglGroups, 0, groups, ++nextPage, url, callback);
                } else {
                    window.setTimeout(callback, 0, groups);
                }
            }
        });
    }

    /* */

    function loadGiveawayTemplates() {
        var GTS;
        GTS = {
            Name: ""
        };
        addGTSView(GTS);
        addGTSSave(GTS);
    }

    function addGTSView(GTS) {
        var Context, GTSContainer, GTSView, Popout, Templates, N, I;
        Context = document.getElementsByClassName("page__heading")[0];
        Context.insertAdjacentHTML(
            "afterBegin",
            "<div>" +
            "    <a class=\"GTSView\" title=\"View saved templates\">" +
            "        <i class=\"fa fa-file\"></i>" +
            "    </a>" +
            "</div>"
        );
        GTSContainer = Context.firstElementChild;
        GTSView = GTSContainer.firstElementChild;
        Popout = createPopout(GTSContainer);
        Popout.customRule = function (Target) {
            return !GTSContainer.contains(Target);
        };
        Templates = GM_getValue("Templates");
        N = Templates.length;
        if (N) {
            for (I = 0; I < N; ++I) {
                Popout.Popout.insertAdjacentHTML(
                    "beforeEnd",
                    "<div class=\"GTSTemplate\">" +
                    "    <span class=\"popup__actions GTSApply\">" +
                    "        <a>" + Templates[I].Name + "</a>" +
                    "    </span>" +
                    "    <i class=\"fa fa-trash GTSDelete\" title=\"Delete template\"></i>" +
                    "</div>");
                setGTSTemplate(Popout.Popout.lastElementChild, Templates[I], GTS);
            }
        } else {
            Popout.Popout.textContent = "No templates saved.";
        }
        GTSView.addEventListener("click", function () {
            if (Popout.Popout.classList.contains("rhHidden")) {
                Popout.popOut(GTSContainer);
            } else {
                Popout.Popout.classList.add("rhHidden");
            }
        });
    }

    function setGTSTemplate(GTSTemplate, Template, GTS) {
        GTSTemplate.firstElementChild.addEventListener("click", function () {
            var CurrentDate, Context, Groups, Matches, I, N, ID, Selected, J;
            CurrentDate = Date.now();
            document.querySelector("[name='start_time']").value = formatDate(new Date(CurrentDate + Template.Delay));
            document.querySelector("[name='end_time']").value = formatDate(new Date(CurrentDate + Template.Delay + Template.Duration));
            document.querySelector("[data-checkbox-value='" + Template.Region + "']").click();
            document.querySelector("[data-checkbox-value='" + Template.Type + "']").click();
            if (Template.Type == "groups") {
                if (Template.Whitelist == 1) {
                    Context = document.getElementsByClassName("form__group--whitelist")[0];
                    if (!Context.classList.contains("is-selected")) {
                        Context.click();
                    }
                }
                if (Template.Groups) {
                    Groups = Template.Groups.trim().split(/\s/);
                    Matches = document.getElementsByClassName("form__group--steam");
                    for (I = 0, N = Matches.length; I < N; ++I) {
                        Context = Matches[I];
                        ID = Context.getAttribute("data-group-id");
                        Selected = Context.classList.contains("is-selected");
                        J = Groups.indexOf(ID);
                        if ((Selected && (J < 0)) || (!Selected && (J >= 0))) {
                            Context.click();
                        }
                    }
                }
            }
            if (Template.Level > 0) {
                document.getElementsByClassName("ui-slider-range")[0].style.width = "100%";
                document.getElementsByClassName("form__level")[0].textContent = "level " + Template.Level;
                document.getElementsByClassName("form__input-description--no-level")[0].classList.add("is-hidden");
                document.getElementsByClassName("form__input-description--level")[0].classList.remove("is-hidden");
            } else {
                document.getElementsByClassName("ui-slider-range")[0].style.width = "0%";
                document.getElementsByClassName("form__input-description--level")[0].classList.add("is-hidden");
                document.getElementsByClassName("form__input-description--no-level")[0].classList.remove("is-hidden");
            }
            document.getElementsByClassName("ui-slider-handle")[0].style.left = (Template.Level * 10) + "%";
            document.querySelector("[name='contributor_level']").value = Template.Level;
            document.querySelector("[name='description']").value = Template.Description;
            GTS.Name = Template.Name;
        });
        GTSTemplate.lastElementChild.addEventListener("click", function () {
            var Templates, I, N;
            if (window.confirm("Are you sure you want to delete this template?")) {
                Templates = GM_getValue("Templates");
                for (I = 0, N = Templates.length; (I < N) && (Templates[I].Name != Template.Name); ++I);
                Templates.splice(I, 1);
                GM_setValue("Templates", Templates);
                if (GTS.Name == Template.Name) {
                    GTS.Name = "";
                }
                GTSTemplate.remove();
            }
        });
    }

    function addGTSSave(GTS) {
        var Context;
        Context = document.getElementsByClassName("form__submit-button")[0];
        Context.insertAdjacentHTML("afterEnd", "<div class=\"GTSSave\"></div>");
        createButton(Context.nextElementSibling, "fa-file", "Save Template", "", "", function (Callback) {
            var Popup;
            Callback();
            Popup = createPopup(true);
            Popup.Icon.classList.add("fa-file");
            Popup.Title.textContent = "Save template:";
            Popup.TextInput.classList.remove("rhHidden");
            Popup.TextInput.insertAdjacentHTML("afterEnd", createDescription("Enter a name for this template."));
            Popup.TextInput.value = GTS.Name;
            createButton(Popup.Button, "fa-check", "Save", "fa-circle-o-notch fa-spin", "Saving...", function (Callback) {
                var StartTime, Delay, Template, Templates, I, N;
                if (Popup.TextInput.value) {
                    StartTime = new Date(document.querySelector("[name='start_time']").value).getTime();
                    Delay = StartTime - (new Date().getTime());
                    Template = {
                        Name: Popup.TextInput.value,
                        Delay: (Delay > 0) ? Delay : 0,
                        Duration: (new Date(document.querySelector("[name='end_time']").value).getTime()) - StartTime,
                        Region: document.querySelector("[name='region']").value,
                        Type: document.querySelector("[name='who_can_enter']").value,
                        Whitelist: document.querySelector("[name='whitelist']").value,
                        Groups: document.querySelector("[name='group_string']").value,
                        Level: document.querySelector("[name='contributor_level']").value,
                        Description: document.querySelector("[name='description']").value
                    };
                    Templates = GM_getValue("Templates");
                    if (GTS.Name == Popup.TextInput.value) {
                        for (I = 0, N = Templates.length; (I < N) && (Templates[I].Name != GTS.Name); ++I);
                        if (I < N) {
                            Templates[I] = Template;
                        } else {
                            Templates.push(Template);
                        }
                    } else {
                        Templates.push(Template);
                    }
                    GM_setValue("Templates", Templates);
                    Callback();
                    Popup.Close.click();
                } else {
                    Popup.Progress.innerHTML =
                        "<i class=\"fa fa-times-circle\"></i> " +
                        "<span>You must enter a name.</span>";
                    Callback();
                }
            });
            Popup.popUp(function () {
                Popup.TextInput.focus();
            });
        });
    }

    function loadStickiedGiveawayGroups(context) {
        if (!esgst.newGiveawayPath) {
            esgst.endlessFeatures.push(getSGGGroups);
        }
        getSGGGroups(context);
    }

    function getSGGGroups(context) {
        var matches = context.getElementsByClassName(`table__row-inner-wrap`);
        setSGGGroups(matches);
    }

    function setSGGGroups(Matches) {
        var StickiedGroups, SGG, Groups, I, NumMatches, Context, ID, Name, J, NumGroups;
        StickiedGroups = GM_getValue("StickiedGroups");
        if (esgst.newGiveawayPath) {
            SGG = {
                Container: document.getElementsByClassName("form__groups")[0]
            };
            SGG.Separator = SGG.Container.firstElementChild.nextElementSibling;
            Matches = SGG.Container.getElementsByClassName("form__group--steam");
            Groups = GM_getValue("Groups");
            for (I = 0, NumMatches = Matches.length; I < NumMatches; ++I) {
                Context = Matches[I];
                ID = Context.getAttribute("data-group-id");
                Name = Context.getElementsByClassName("form__group__name")[0].textContent.substr(0, 22);
                if (StickiedGroups.indexOf(ID) < 0) {
                    setSGGButton(Context, true, ID, SGG);
                } else {
                    if (Context == SGG.Separator) {
                        SGG.Separator = SGG.Separator.nextElementSibling;
                    }
                    SGG.Container.insertBefore(Context, SGG.Separator);
                    setSGGButton(Context, false, ID, SGG);
                }
                for (J = 0, NumGroups = Groups.length; (J < NumGroups) && (Groups[J].Name.substr(0, 22) != Name); ++J);
                if ((J < NumGroups) && !Groups[J].ID) {
                    Groups[J].ID = ID;
                }
            }
            GM_setValue("Groups", Groups);
        } else {
            Groups = GM_getValue("Groups");
            for (I = 0, NumMatches = Matches.length; I < NumMatches; ++I) {
                Context = Matches[I];
                Name = Context.getElementsByClassName("table__column__heading")[0].textContent;
                for (J = 0, NumGroups = Groups.length; (J < NumGroups) && (Groups[J].Name != Name); ++J);
                if (J < NumGroups) {
                    ID = Groups[J].ID;
                    if (ID) {
                        setSGGButton(Context, StickiedGroups.indexOf(ID) < 0, ID);
                    }
                }
            }
        }
    }

    function setSGGButton(Context, Sticky, ID, SGG) {
        Context.insertAdjacentHTML(
            "afterBegin",
            "<a class=\"" + (Sticky ? "SGGSticky" : "SGGUnsticky") + "\" title=\"" + (Sticky ? "Sticky" : "Unsticky") + " group\">" +
            "    <i class=\"fa fa-thumb-tack\"></i>" +
            "</a>"
        );
        Context.firstElementChild.addEventListener("click", function (Event) {
            var StickiedGroups;
            Event.stopPropagation();
            StickiedGroups = GM_getValue("StickiedGroups");
            if (Sticky) {
                StickiedGroups.push(ID);
                if (SGG) {
                    if (Context == SGG.Separator) {
                        SGG.Separator = SGG.Separator.nextElementSibling;
                    }
                    SGG.Container.insertBefore(Context, SGG.Separator);
                }
            } else {
                StickiedGroups.splice(StickiedGroups.indexOf(ID), 1);
                if (SGG) {
                    SGG.Container.insertBefore(Context, SGG.Separator);
                    SGG.Separator = SGG.Separator.previousElementSibling;
                }
            }
            GM_setValue("StickiedGroups", StickiedGroups);
            Event.currentTarget.remove();
            setSGGButton(Context, !Sticky, ID, SGG);
        });
    }

    function loadRealCvCalculator() {
        var table = document.getElementsByClassName(`table--summary`)[0], button;
        if (table) {
            var game = GM_getValue(`rcvcGame`);
            if (game) {
                var type = game.type;
                var id = game.id;
                var i, n;
                var headings = document.getElementsByClassName(`featured__heading__small`);
                var copiesHeading, pointsHeading;
                if (headings.length > 1) {
                    copiesHeading = headings[0];
                    pointsHeading = headings[1];
                } else {
                    pointsHeading = headings[0];
                }
                var copies;
                if (copiesHeading) {
                    copies = parseInt(copiesHeading.textContent.match(/\d+/)[0]);
                } else {
                    copies = 1;
                }
                var value = parseInt(pointsHeading.textContent.match(/\d+/)[0]);
                var games = JSON.parse(GM_getValue(`games`));
                if (games[type][id] && games[type][id].bundled) {
                    value *= 0.15;
                }
                var user = {
                    Username: GM_getValue(`Username`),
                    SteamID64: GM_getValue(`SteamID64`)
                };
                var users = JSON.parse(GM_getValue(`users`));
                var savedUser = users.users[user.SteamID64];
                var sent = 0;
                if (savedUser && savedUser.ugd && savedUser.ugd.sent && savedUser.ugd.sent[type][id]) {
                    var giveaways = savedUser.ugd.sent[type][id];
                    for (i = 0, n = giveaways.length; i < n; ++i) {
                        var giveaway = giveaways[i];
                        if (((giveaways.entries < 5) && !giveaway.inviteOnly && !giveaway.group && !giveaway.whitelist) ||
                            (giveaway.entries >= 5)
                        ) {
                            if (giveaway.entries >= giveaway.copies) {
                                sent += giveaway.copies;
                            } else {
                                sent += giveaway.entries;
                            }
                        }
                    }
                    if (sent > 5) {
                        for (i = 0, n = sent - 5; i < n; ++i) {
                            value *= 0.90;
                        }
                    }
                }
                var cv;
                if (copies > 1) {
                    var total = copies + sent;
                    if (total > 5) {
                        n = total - 5;
                        cv = (copies - n) * value;
                        for (i = 0; i < n; ++i) {
                            value *= 0.90;
                            cv += value;
                        }
                    } else {
                        cv = value * copies;
                    }
                } else if ((sent + 1) > 5) {
                    cv = value * 0.90;
                } else {
                    cv = value;
                }
                cv = Math.round(cv * 100) / 100;
                var html = `
<div class="table__row-outer-wrap">
<div class="table__row-inner-wrap">
<div class="table__column--width-medium table__column--align-top">
<strong>Real CV</strong>
</div>
<div class="table__column--width-fill">You should get ~$${cv} real CV for this giveaway.</div>
</div>
</div>
`;
                table.insertAdjacentHTML(`beforeEnd`, html);
                button = document.getElementsByClassName(`js__submit-form`)[0];
                button.addEventListener(`click`, function () {
                    GM_deleteValue(`rcvcGame`);
                });
            }
        } else {
            button = document.getElementsByClassName(`js__submit-form`)[0];
            var input = document.querySelector(`[name="game_id"]`);
            button.addEventListener(`click`, function () {
                var selectedId = input.value;
                var selected = document.querySelector(`[data-autocomplete-id="${selectedId}"]`);
                var info = getGameInfo(selected);
                GM_setValue(`rcvcGame`, {
                    type: info.type,
                    id: info.id
                });
            });
        }
    }

    function loadUnsentGiftsSender() {
        if (esgst.newTicketPath) {
            setUGSObserver();
        } else {
            addUGSButton(esgst.mainPageHeading);
        }
    }

    function setUGSObserver() {
        document.getElementsByClassName("form__submit-button")[0].addEventListener("click", function () {
            var Winner, Rerolls;
            if (document.querySelector("[name='category_id']").value == 1) {
                Winner = document.querySelector("[name='reroll_winner_id']").value;
                Rerolls = GM_getValue("Rerolls");
                if (Rerolls.indexOf(Winner) < 0) {
                    Rerolls.push(Winner);
                    GM_setValue("Rerolls", Rerolls);
                }
            }
        });
    }

    function addUGSButton(Context) {
        var Popup, UGS, UGSButton;
        Popup = createPopup();
        Popup.Icon.classList.add("fa-gift");
        Popup.Title.textContent = "Send unsent gifts:";
        UGS = {};
        createOptions(Popup.Options, UGS, [{
            Check: function () {
                return true;
            },
            Description: "Only send to users with 0 not activated / multiple wins.",
            Title: "This option will retrieve the results in real time, without using caches.",
            Name: "SendActivatedNotMultiple",
            Key: "SANM",
            ID: "UGS_SANM"
        }, {
            Check: function () {
                return true;
            },
            Description: "Only send to users who are whitelisted.",
            Title: "This option will use your whitelist cache.\nMake sure to sync it through the settings menu if you whitelisted a new user since the last sync.\n" + (
                "Whitelisted users get a pass for not activated / multiple wins."),
            Name: "SendWhitelist",
            Key: "SW",
            ID: "UGS_SW"
        }, {
            Check: function () {
                return true;
            },
            Description: "Only send to users who are still members of at least one of the groups for group giveaways.",
            Title: "This option will retrieve the results in real time.\n" + (
                "Group members get a pass for not activated / multiple wins and for not being whitelisted."),
            Name: "SendGroup",
            Key: "G",
            ID: "UGS_G"
        }]);
        Context.insertAdjacentHTML(
            "afterBegin",
            "<a class=\"UGSButton\" title=\"Send unsent gifts\">" +
            "    <i class=\"fa fa-gift\"></i>" +
            "    <i class=\"fa fa-send\"></i>" +
            "</a>"
        );
        UGSButton = Context.firstElementChild;
        createButton(Popup.Button, "fa-send", "Send", "fa-times-circle", "Cancel", function (Callback) {
            var Match;
            UGSButton.classList.add("rhBusy");
            UGS.Progress.innerHTML = UGS.OverallProgress.innerHTML = "";
            UGS.Sent.classList.add("rhHidden");
            UGS.Unsent.classList.add("rhHidden");
            UGS.SentCount.textContent = UGS.UnsentCount.textContent = "0";
            UGS.SentUsers.innerHTML = UGS.UnsentUsers.innerHTML = "";
            UGS.Canceled = false;
            UGS.Giveaways = [];
            UGS.Checked = [];
            UGS.Winners = GM_getValue("Winners");
            Match = window.location.href.match(/page=(\d+)/);
            getUGSGiveaways(UGS, 1, Match ? parseInt(Match[1]) : 1, function () {
                var N;
                N = UGS.Giveaways.length;
                if (N > 0) {
                    if (UGS.G.checked) {
                        getUgsGiveawayGroups(UGS, 0, N, function () {
                            getUGSWinners(UGS, 0, N, function () {
                                UGSButton.classList.remove("rhBusy");
                                UGS.Progress.innerHTML = UGS.OverallProgress.innerHTML = "";
                                GM_setValue("Winners", UGS.Winners);
                                Callback();
                            });
                        });
                    } else {
                        getUGSWinners(UGS, 0, N, function () {
                            UGSButton.classList.remove("rhBusy");
                            UGS.Progress.innerHTML = UGS.OverallProgress.innerHTML = "";
                            GM_setValue("Winners", UGS.Winners);
                            Callback();
                        });
                    }
                } else {
                    UGSButton.classList.remove("rhBusy");
                    UGS.Progress.innerHTML =
                        "<i class=\"fa fa-check-circle giveaway__column--positive\"></i> " +
                        "<span>You have no unsent gifts.</span>";
                    UGS.OverallProgress.innerHTML = "";
                    Callback();
                }
            });
        }, function () {
            clearInterval(UGS.Request);
            clearInterval(UGS.Save);
            UGS.Canceled = true;
            setTimeout(function () {
                UGS.Progress.innerHTML = UGS.OverallProgress.innerHTML = "";
            }, 500);
            UGSButton.classList.remove("rhBusy");
        });
        UGS.Progress = Popup.Progress;
        UGS.OverallProgress = Popup.OverallProgress;
        createResults(Popup.Results, UGS, [{
            Icon: "<i class=\"fa fa-check-circle giveaway__column--positive\"></i> ",
            Description: "Sent gifts to ",
            Key: "Sent"
        }, {
            Icon: "<i class=\"fa fa-times-circle giveaway__column--negative\"></i> ",
            Description: "Did not send gifts to ",
            Key: "Unsent"
        }]);
        UGSButton.addEventListener("click", function () {
            UGS.Popup = Popup.popUp();
        });
    }

    function getUgsGiveawayGroups(ugs, i, n, callback) {
        if (i < n) {
            ugs.Giveaways[i].Groups = [];
            getNextUgsGiveawayGroupsPage(ugs, i, `${ugs.Giveaways[i].URL.replace(/\/winners/, ``)}/groups/search?page=`, 1, function () {
                window.setTimeout(getUgsGiveawayGroups, 0, ugs, ++i, n, callback);
            });
        } else {
            callback();
        }
    }

    function getNextUgsGiveawayGroupsPage(ugs, I, url, nextPage, callback, context) {
        if (context) {
            var matches = context.getElementsByClassName(`table__column__heading`);
            for (var i = 0, n = matches.length; i < n; ++i) {
                var title = matches[i].getAttribute(`href`).match(/\/group\/.+\/(.+)/)[1];
                ugs.Giveaways[I].Groups.push(title);
            }
            var paginationNavigation = context.getElementsByClassName(`pagination__navigation`)[0];
            if (paginationNavigation && !paginationNavigation.lastElementChild.classList.contains(`is-selected`)) {
                window.setTimeout(getNextUgsGiveawayGroupsPage, 0, ugs, I, url, nextPage, callback);
            } else {
                callback();
            }
        } else {
            ugs.Progress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>Getting " + ugs.Giveaways[I].Name + "'s groups...</span>";
            queueRequest(ugs, null, `${url}${nextPage}`, function (response) {
                var context = DOM.parse(response.responseText);
                window.setTimeout(getNextUgsGiveawayGroupsPage, 0, ugs, I, url, ++nextPage, callback, context);
            });
        }
    }

    function getUGSGiveaways(UGS, NextPage, CurrentPage, Callback, Context) {
        var Matches, N, I, Pagination;
        if (Context) {
            Matches = Context.getElementsByClassName("fa icon-red fa-warning");
            N = Matches.length;
            if (N > 0) {
                for (I = 0; I < N; ++I) {
                    UGS.Giveaways.push({
                        Name: Matches[I].closest(".table__row-inner-wrap").getElementsByClassName("table__column__heading")[0].textContent.match(/(.+?)( \(.+ Copies\))?$/)[1],
                        URL: Matches[I].nextElementSibling.getAttribute("href"),
                        Context: Matches[I]
                    });
                }
                Pagination = Context.getElementsByClassName("pagination__navigation")[0];
                if (Pagination && !Pagination.lastElementChild.classList.contains("is-selected")) {
                    window.setTimeout(getUGSGiveaways, 0, UGS, NextPage, CurrentPage, Callback);
                } else {
                    Callback();
                }
            } else {
                Callback();
            }
        } else if (!UGS.Canceled) {
            UGS.Progress.innerHTML =
                "<i class=\"fa fa-circle-o-notch\"></i> " +
                "<span>Retrieving unsent giveaways (page " + NextPage + ")...</span>";
            if (CurrentPage != NextPage) {
                if (!document.getElementById(`esgst-es-page-${NextPage}`)) {
                    queueRequest(UGS, null, "/giveaways/created/search?page=" + NextPage, function (Response) {
                        window.setTimeout(getUGSGiveaways, 0, UGS, ++NextPage, CurrentPage, Callback, DOM.parse(Response.responseText));
                    });
                } else {
                    window.setTimeout(getUGSGiveaways, 0, UGS, ++NextPage, CurrentPage, Callback);
                }
            } else {
                window.setTimeout(getUGSGiveaways, 0, UGS, ++NextPage, CurrentPage, Callback, document);
            }
        }
    }

    function checkUgsUserGroups(ugs, i, n, j, steamId64, callback) {
        if (i < n) {
            makeRequest(null, `http://steamcommunity.com/groups/${ugs.Giveaways[j].Groups[i]}/memberslistxml/?xml=1`, ugs, function (response) {
                var responseText = response.responseText;
                var reg = new RegExp(`<steamID64>${steamId64}</steamID64>`);
                if (reg.exec(responseText)) {
                    callback(true);
                } else {
                    window.setTimeout(checkUgsUserGroups, 0, ugs, ++i, n, j, steamId64, callback);
                }
            });
        } else {
            callback(false);
        }
    }

    function getUGSWinners(UGS, I, N, Callback) {
        if (!UGS.Canceled) {
            UGS.OverallProgress.textContent = I + " of " + N + " giveaways retrieved...";
            if (I < N) {
                UGS.Progress.innerHTML =
                    "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                    "<span>Retrieving winners...</span>";
                queueRequest(UGS, null, UGS.Giveaways[I].URL, function (Response) {
                    var ResponseHTML, Matches, Winners, J, NumMatches, WinnersKeys;
                    ResponseHTML = DOM.parse(Response.responseText);
                    Matches = ResponseHTML.getElementsByClassName("table__row-inner-wrap");
                    Winners = {};
                    for (J = 0, NumMatches = Matches.length; J < NumMatches; ++J) {
                        Winners[Matches[J].getElementsByClassName("table__column__heading")[0].textContent] = Matches[J].querySelector("[name='winner_id']").value;
                    }
                    if (NumMatches < 25) {
                        WinnersKeys = sortArray(Object.keys(Winners));
                        sendUGSGifts(UGS, 0, WinnersKeys.length, I, WinnersKeys, Winners, function () {
                            window.setTimeout(getUGSWinners, 0, UGS, ++I, N, Callback);
                        });
                    } else {
                        queueRequest(UGS, null, UGS.Giveaways[I].URL + "/search?page=2", function (Response) {
                            Matches = DOM.parse(Response.responseText).getElementsByClassName("table__row-inner-wrap");
                            for (J = 0, NumMatches = Matches.length; J < NumMatches; ++J) {
                                Winners[Matches[J].getElementsByClassName("table__column__heading")[0].textContent] = Matches[J].querySelector("[name='winner_id']").value;
                            }
                            WinnersKeys = sortArray(Object.keys(Winners));
                            sendUGSGifts(UGS, 0, WinnersKeys.length, I, WinnersKeys, Winners, function () {
                                window.setTimeout(getUGSWinners, 0, UGS, ++I, N, Callback);
                            });
                        });
                    }
                });
            } else {
                Callback();
            }
        }
    }

    function sendUGSGifts(UGS, I, N, J, Keys, Winners, Callback) {
        var Reroll, SANM, SW, G;
        if (!UGS.Canceled) {
            UGS.OverallProgress.innerHTML = I + " of " + N + " winners checked...";
            if (I < N) {
                UGS.Progress.innerHTML =
                    "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                    "<span>Sending " + UGS.Giveaways[J].Name + " to " + Keys[I] + "...</span>";
                Reroll = GM_getValue("Rerolls").indexOf(Winners[Keys[I]]) < 0;
                if (Reroll && (UGS.Checked.indexOf(Keys[I] + UGS.Giveaways[J].Name) < 0)) {
                    SANM = UGS.SANM.checked;
                    SW = UGS.SW.checked;
                    G = UGS.G.checked;
                    if (SANM || SW || G) {
                        createLock(`userLock`, 300, function(deleteLock) {
                            var users = JSON.parse(GM_getValue(`users`));
                            getSteamId(null, null, Keys[I], users, function(steamId) {
                                GM_setValue(`users`, JSON.stringify(users));
                                var username = users.users[steamId].username;
                                deleteLock();
                                if (G && UGS.Giveaways[J].Groups.length) {
                                    UGS.Progress.innerHTML =
                                        "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                                        "<span>Checking if user is a member of one of the " + UGS.Giveaways[J].Name + " groups...</span>";
                                    checkUgsUserGroups(UGS, 0, UGS.Giveaways[J].Groups.length, J, steamId, function (member) {
                                        if (member) {
                                            sendUGSGift(UGS, Winners, Keys, I, J, N, Callback);
                                        } else {
                                            UGS.Checked.push(Keys[I] + UGS.Giveaways[J].Name);
                                            UGS.Unsent.classList.remove("rhHidden");
                                            UGS.UnsentCount.textContent = parseInt(UGS.UnsentCount.textContent) + 1;
                                            UGS.UnsentUsers.insertAdjacentHTML(
                                                "beforeEnd",
                                                "<span><a href=\"/user/" + Keys[I] + "\">" + Keys[I] + "</a> (<a href=\"" + UGS.Giveaways[J].URL + "\">" + UGS.Giveaways[J].Name + "</a>)</span>"
                                            );
                                            sendUGSGifts(UGS, ++I, N, J, Keys, Winners, Callback);
                                        }
                                    });
                                } else if (SANM) {
                                    if (SW && users.users[steamId].whitelisted) {
                                        sendUGSGift(UGS, Winners, Keys, I, J, N, Callback);
                                    } else {
                                        var namwc = users.users[steamId].namwc;
                                            if (!namwc) {
                                                namwc = {
                                                    results: {}
                                                };
                                            }
                                            checkNAMWCNotActivated(UGS, namwc, username, function (namwc) {
                                                checkNAMWCMultiple(UGS, namwc, username, function (namwc) {
                                                    createLock(`userLock`, 300, function(deleteLock) {
                                                        users = JSON.parse(GM_getValue(`users`));
                                                        users.users[steamId].namwc = namwc;
                                                        GM_setValue(`users`, JSON.stringify(users));
                                                        deleteLock();
                                                            if (namwc.results.activated && namwc.results.notMultiple) {
                                                                sendUGSGift(UGS, Winners, Keys, I, J, N, Callback);
                                                            } else {
                                                                UGS.Checked.push(Keys[I] + UGS.Giveaways[J].Name);
                                                                UGS.Unsent.classList.remove("rhHidden");
                                                                UGS.UnsentCount.textContent = parseInt(UGS.UnsentCount.textContent) + 1;
                                                                UGS.UnsentUsers.insertAdjacentHTML(
                                                                    "beforeEnd",
                                                                    "<span><a href=\"/user/" + Keys[I] + "\">" + Keys[I] + "</a> (<a href=\"" + UGS.Giveaways[J].URL + "\">" +
                                                                    UGS.Giveaways[J].Name + "</a>)</span>"
                                                                );
                                                                sendUGSGifts(UGS, ++I, N, J, Keys, Winners, Callback);
                                                            }
                                                        });
                                                    });
                                                });
                                    }
                                } else if (users.users[steamId].whitelisted) {
                                    sendUGSGift(UGS, Winners, Keys, I, J, N, Callback);
                                } else {
                                    UGS.Checked.push(Keys[I] + UGS.Giveaways[J].Name);
                                    UGS.Unsent.classList.remove("rhHidden");
                                    UGS.UnsentCount.textContent = parseInt(UGS.UnsentCount.textContent) + 1;
                                    UGS.UnsentUsers.insertAdjacentHTML(
                                        "beforeEnd",
                                        "<span><a href=\"/user/" + Keys[I] + "\">" + Keys[I] + "</a> (<a href=\"" + UGS.Giveaways[J].URL + "\">" + UGS.Giveaways[J].Name + "</a>)</span>"
                                    );
                                    sendUGSGifts(UGS, ++I, N, J, Keys, Winners, Callback);
                                }
                            });
                        });
                    } else {
                        sendUGSGift(UGS, Winners, Keys, I, J, N, Callback);
                    }
                } else {
                    UGS.Checked.push(Keys[I] + UGS.Giveaways[J].Name);
                    UGS.Unsent.classList.remove("rhHidden");
                    UGS.UnsentCount.textContent = parseInt(UGS.UnsentCount.textContent) + 1;
                    UGS.UnsentUsers.insertAdjacentHTML(
                        "beforeEnd",
                        "<span><a href=\"/user/" + Keys[I] + "\">" + Keys[I] + "</a> (" + (!Reroll ? ("Being rerolled for <a href=\"" + UGS.Giveaways[J].URL + "\">" + UGS.Giveaways[J].Name +
                            "</a>.)") : ("Already won <a href=\"" + UGS.Giveaways[J].URL + "\">" +
                                UGS.Giveaways[J].Name + "</a> from you.)")) + "</span>"
                    );
                    sendUGSGifts(UGS, ++I, N, J, Keys, Winners, Callback);
                }
            } else {
                Callback();
            }
        }
    }

    function sendUGSGift(UGS, Winners, Keys, I, J, N, Callback) {
        if (!UGS.Canceled) {
            queueRequest(UGS, "xsrf_token=" + esgst.xsrfToken + "&do=sent_feedback&action=1&winner_id=" + Winners[Keys[I]], "/ajax.php", function () {
                var Key;
                UGS.Checked.push(Keys[I] + UGS.Giveaways[J].Name);
                UGS.Sent.classList.remove("rhHidden");
                UGS.SentCount.textContent = parseInt(UGS.SentCount.textContent) + 1;
                UGS.SentUsers.insertAdjacentHTML(
                    "beforeEnd",
                    "<span><a href=\"/user/" + Keys[I] + "\">" + Keys[I] + "</a> (<a href=\"" + UGS.Giveaways[J].URL + "\">" + UGS.Giveaways[J].Name + "</a>)</span>"
                );
                UGS.Giveaways[J].Context.className = "fa fa-check-circle icon-green";
                UGS.Giveaways[J].Context.nextElementSibling.textContent = "Sent";
                Key = UGS.Giveaways[J].URL.match(/\/giveaway\/(.+?)\//)[1];
                if (!UGS.Winners[Key]) {
                    UGS.Winners[Key] = [];
                }
                if (UGS.Winners[Key].indexOf(Keys[I]) < 0) {
                    UGS.Winners[Key].push(Keys[I]);
                }
                sendUGSGifts(UGS, ++I, N, J, Keys, Winners, Callback);
            });
        }
    }

    function loadEntriesRemover() {
        if (esgst.enteredPath) {
            addERButton(esgst.mainPageHeading);
        } else {
            addERButton();
        }
    }

    function addERButton(Context) {
        var HTML, Button, Popup, URL, CurrentPage, NextPage, RemovedEntries, ownedGames;
        if (Context) {
            HTML = `
<div class="ERButton" title="Remove entries for owned games">
<i class="fa fa-tag"></i>
<i class="fa fa-times-circle"></i>
</div>
`;
            Context.insertAdjacentHTML(`afterBegin`, HTML);
            Button = Context.firstElementChild;
        } else {
            Button = document.getElementsByClassName(`form__sync-default`)[0];
        }
        if (Button) {
            Popup = createPopup();
            Popup.Popup.classList.add(`rhPopupLarge`);
            Popup.Icon.classList.add(`fa-times`);
            Popup.Title.textContent = `Remove entries for owned games:`;
            URL = `/giveaways/entered/search?page=`;
            if (window.location.pathname.match(/^\/giveaways\/entered/)) {
                CurrentPage = esgst.currentPage;
            } else {
                CurrentPage = 0;
            }
            NextPage = 1;
            Button.addEventListener(`click`, openPopup);
        }

        function openPopup() {
            Button.classList.add(`rhBusy`);
            Popup.popUp(getResult);
        }

        function getResult() {
            syncGames(Popup, checkResult);
        }

        function checkResult(Result, games) {
            Popup.OverallProgress.textContent = `Removing entries...`;
            switch (Result) {
                case 1:
                    ownedGames = games;
                    RemovedEntries = {};
                    checkNextPage();
                    break;
                case 2:
                    showResult(`<strong>0 new games found.</strong>`);
                    break;
                case 3:
                    showResult(`<strong>You are not logged in on Steam. Please log in so you can sync.</strong>`);
                    break;
            }
        }

        function showResult(Result) {
            Popup.Progress.innerHTML = Popup.OverallProgress.innerHTML = ``;
            Popup.Results.innerHTML = Result;
            Button.classList.remove(`rhBusy`);
        }

        function checkNextPage() {
            Popup.Progress.innerHTML = `
<i class="fa fa-circle-o-notch fa-spin"></i>
<span>Checking page ${NextPage}...</span>
`;
            if (CurrentPage != NextPage) {
                queueRequest(Popup, null, `${URL}${NextPage}`, getNextPage);
            } else {
                goToNextPage(document);
            }
        }

        function getNextPage(Response) {
            goToNextPage(DOM.parse(Response.responseText));
        }

        function goToNextPage(Context) {
            ++NextPage;
            setTimeout(getEntries, 0, Context);
        }

        function getEntries(Context) {
            var Entries, N;
            Entries = Context.getElementsByClassName(`table__remove-default`);
            N = Entries.length;
            if (N > 0) {
                checkEntries(0, N, Entries, Context);
            } else {
                checkRemovedEntries();
            }
        }

        function checkEntries(I, N, Entries, Context) {
            checkEntry();

            function checkEntry() {
                var Entry, Container, Image, Match, ID, Type, Title, Code, Data, Pagination;
                if (I < N) {
                    Entry = Entries[I];
                    Container = Entry.closest(`.table__row-inner-wrap`);
                    Image = Container.getElementsByClassName(`global__image-inner-wrap`)[0];
                    if (Image) {
                        Match = Image.getAttribute(`style`).match(/\/(apps|subs)\/(\d+)/);
                        ID = parseInt(Match[2]);
                        if (ownedGames[Match[1]][ID] && ownedGames[Match[1]][ID].owned) {
                            Type = Match[1].replace(/s$/, ``);
                            Title = Container.getElementsByClassName(`table__column__heading`)[0].textContent;
                            if (!RemovedEntries[ID]) {
                                RemovedEntries[ID] = {
                                    Type: Type,
                                    Title: Title,
                                    Entries: 0
                                };
                            }
                            ++RemovedEntries[ID].Entries;
                            if (Context == document) {
                                Entry.click();
                                goToNextEntry();
                            } else {
                                Code = Container.querySelector(`[name="code"]`).value;
                                Data = `xsrf_token=${esgst.xsrfToken}&do=entry_delete&code=${Code}`;
                                queueRequest(Popup, Data, `/ajax.php`, goToNextEntry);
                            }
                        } else {
                            goToNextEntry();
                        }
                    } else {
                        goToNextEntry();
                    }
                } else {
                    Pagination = Context.getElementsByClassName(`pagination__navigation`)[0];
                    if (Pagination && !Pagination.lastElementChild.classList.contains(`is-selected`)) {
                        checkNextPage();
                    } else {
                        checkRemovedEntries();
                    }
                }
            }

            function goToNextEntry() {
                ++I;
                setTimeout(checkEntry, 0);
            }
        }

        function checkRemovedEntries() {
            var Results, N, Key, Entry, Result;
            Results = [];
            N = 0;
            for (Key in RemovedEntries) {
                Entry = RemovedEntries[Key];
                Result = `
<a href="https://store.steampowered.com/${Entry.Type}/${Key}" target="_blank">
${Entry.Title} (${Entry.Entries})
</a>
`;
                Results.push(Result);
                N += Entry.Entries;
            }
            if (Results.length) {
                Result = `
<strong>${N} entries removed:</strong>
<span class="popup__actions">
${Results.join(``)}
</span>
`;
                showResult(Result);
            } else {
                showResult(`<strong>0 entries removed.</strong>`);
            }
        }
    }



    function loadGiveawayErrorSearchLinks() {
        var Context, Term;
        if (document.querySelector(".table.table--summary")) {
            Context = document.getElementsByClassName("table__column__secondary-link")[0];
            Term = encodeURIComponent(Context.innerHTML);
            document.getElementsByClassName("table__row-outer-wrap")[0].insertAdjacentHTML(
                "afterEnd",
                `<div class="table__row-outer-wrap">
<div class="table__row-inner-wrap">
<div class="table__column--width-small">
<strong>Search Links</strong>
</div>
<div class="table__column--width-fill">
<a href="https://www.steamgifts.com/giveaways/search?q=` + Term + `" target="_blank">
<i class="fa"><img src="https://cdn.steamgifts.com/img/favicon.ico"></i>
</a>&nbsp;
<a href="https://steamdb.info/search/?a=app&amp;q=` + Term + `" target="_blank">
<i class="fa"><img src="https://steamdb.info/static/logos/favicon-16x16.png"></i>
</a>&nbsp;
<a href="http://store.steampowered.com/search/?term=` + Term + `" target="_blank">
<i class="fa fa-steam"></i>
</a>
</div>
</div>
</div>`
            );
        }
    }

    function loadArchiveSearcher() {
        var Popup, Category, AS, ASButton;
        var Context = esgst.mainPageHeading;
        Popup = createPopup();
        Popup.Popup.style.width = "600px";
        Popup.Icon.classList.add("fa-folder");
        Category = window.location.pathname.match(/^\/archive\/(coming-soon|open|closed|deleted)/);
        Popup.Title.textContent = "Search archive" + (Category ? (" for " + Category[1] + " giveaways") : "") + ":";
        Popup.TextInput.classList.remove("rhHidden");
        AS = {};
        createOptions(Popup.Options, AS, [{
            Check: function () {
                return true;
            },
            Description: "Search by AppID.",
            Title: "If unchecked, a search by exact title will be performed.",
            Key: "AIS",
            Name: "AppIDSearch",
            ID: "AS_AIS"
        }]);
        Context.insertAdjacentHTML(
            "afterBegin",
            "<a class=\"ASButton\" title=\"Search archive\">" +
            "    <i class=\"fa fa-folder\"></i>" +
            "    <i class=\"fa fa-search\"></i>" +
            "</a>"
        );
        ASButton = Context.firstElementChild;
        createButton(Popup.Button, "fa-search", "Search", "fa-times-circle", "Cancel", function (Callback) {
            ASButton.classList.add("rhBusy");
            AS.Progress.innerHTML = AS.OverallProgress.innerHTML = AS.Results.innerHTML = "";
            AS.Popup.reposition();
            AS.Canceled = false;
            AS.Query = Popup.TextInput.value;
            if (AS.Query) {
                if (AS.AIS.checked) {
                    AS.Progress.innerHTML =
                        "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                        "<span>Retrieving game title...</span>";
                    makeRequest(null, "https://steamcommunity.com/app/" + AS.Query, AS.Progress, function (Response) {
                        var Title;
                        Title = DOM.parse(Response.responseText).getElementsByClassName("apphub_AppName")[0];
                        if (Title) {
                            AS.Query = Title.textContent;
                            setASSearch(AS, ASButton, Callback);
                        } else {
                            ASButton.classList.remove("rhBusy");
                            AS.Progress.innerHTML =
                                "<i class=\"fa fa-times-circle\"></i> " +
                                "<span>Game title not found. Make sure you are entering a valid AppID. For example, 229580 is the AppID for Dream (http://steamcommunity.com/app/229580).</span>";
                            Callback();
                        }
                    });
                } else {
                    setASSearch(AS, ASButton, Callback);
                }
            } else {
                ASButton.classList.remove("rhBusy");
                AS.Progress.innerHTML =
                    "<i class=\"fa fa-times-circle\"></i> " +
                    "<span>Please enter a title / AppID.</span>";
                Callback();
            }
        }, function () {
            clearInterval(AS.Request);
            AS.Canceled = true;
            setTimeout(function () {
                AS.Progress.innerHTML = "";
            }, 500);
            ASButton.classList.remove("rhBusy");
        });
        AS.Progress = Popup.Progress;
        AS.OverallProgress = Popup.OverallProgress;
        AS.Results = Popup.Results;
        ASButton.addEventListener("click", function () {
            AS.Popup = Popup.popUp(function () {
                Popup.TextInput.focus();
            });
        });
    }

    function setASSearch(AS, ASButton, Callback) {
        AS.Query = ((AS.Query.length >= 50) ? AS.Query.slice(0, 50) : AS.Query).toLowerCase();
        searchASGame(AS, window.location.href.match(/(.+?)(\/search.+?)?$/)[1] + "/search?q=" + encodeURIComponent(AS.Query) + "&page=", 1, function () {
            ASButton.classList.remove("rhBusy");
            AS.Progress.innerHTML = "";
            Callback();
        });
    }

    function searchASGame(AS, URL, NextPage, Callback) {
        if (!AS.Canceled) {
            AS.Progress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>Loading page " + NextPage + "...</span>";
            queueRequest(AS, null, URL + NextPage, function (Response) {
                var ResponseHTML, Matches, I, N, Title, Pagination;
                ResponseHTML = DOM.parse(Response.responseText);
                Matches = ResponseHTML.getElementsByClassName("table__row-outer-wrap");
                for (I = 0, N = Matches.length; I < N; ++I) {
                    Title = Matches[I].getElementsByClassName("table__column__heading")[0].textContent.match(/(.+?)( \(.+ Copies\))?$/)[1];
                    if (Title.toLowerCase() == AS.Query) {
                        AS.Results.appendChild(Matches[I].cloneNode(true));
                        loadEndlessFeatures(AS.Results.lastElementChild);
                        AS.Popup.reposition();
                    }
                }
                AS.OverallProgress.textContent = AS.Results.children.length + " giveaways found...";
                Pagination = ResponseHTML.getElementsByClassName("pagination__navigation")[0];
                if (Pagination && !Pagination.lastElementChild.classList.contains("is-selected")) {
                    searchASGame(AS, URL, ++NextPage, Callback);
                } else {
                    Callback();
                }
            });
        }
    }

    function loadActiveDiscussionsOnTop() {
        esgst.activeDiscussions.classList.remove(`widget-container--margin-top`);
        esgst.activeDiscussions.classList.add(`esgst-adot`);
        var parent = esgst.activeDiscussions.parentElement;
        parent.insertBefore(esgst.activeDiscussions, parent.firstElementChild);
    }

    function loadMainPostPopup() {
        var MPPPost, Sibling, Visited, Timestamp, Hidden;
        var Context = esgst.mainPageHeading;
        Context.insertAdjacentHTML(
            "afterBegin",
            "<a class=\"MPPButton\" title=\"Open the main post\">" +
            "    <i class=\"fa fa-home\"></i>" +
            "</a>"
        );
        MPPPost = document.createElement("div");
        MPPPost.className = "page__outer-wrap";
        do {
            Sibling = Context.previousElementSibling;
            if (Sibling) {
                MPPPost.insertBefore(Sibling, MPPPost.firstElementChild);
            }
        } while (Sibling);
        Context.parentElement.insertBefore(MPPPost, Context);
        if (GM_getValue("CT")) {
            Visited = GM_getValue("Comments" + (esgst.sg ? "" : "_ST"))[window.location.pathname.match(/^\/(giveaway(?!.+(entries|winners))|discussion|support\/ticket|trade)\/(.+?)\//)[3]];
            Timestamp = MPPPost.querySelectorAll("[data-timestamp]");
            Timestamp = parseInt(Timestamp[Timestamp.length - 1].getAttribute("data-timestamp"));
            Hidden = Visited ? (((Visited[""] == Timestamp) || (GM_getValue("MPP_FV") && Visited.Visited)) ? true : false) : false;
        } else {
            Hidden = true;
        }
        MPPPost.classList.add(Hidden ? "MPPPostOpen" : "MPPPostDefault");
        Context.firstElementChild.addEventListener("click", function () {
            if (!Hidden) {
                MPPPost.classList.remove("MPPPostDefault");
                MPPPost.classList.add("MPPPostOpen");
            }
            $(MPPPost).bPopup({
                amsl: [0],
                fadeSpeed: 200,
                followSpeed: 500,
                modalColor: "#3c424d",
                opacity: 0.85,
                onClose: function () {
                    if (!Hidden) {
                        MPPPost.classList.remove("MPPPostOpen");
                        MPPPost.classList.add("MPPPostDefault");
                        MPPPost.removeAttribute("style");
                        Context.parentElement.insertBefore(MPPPost, Context);
                    }
                }
            });
        });
    }

    function loadDiscussionEditDetector() {
        addDEDButton(esgst.replyBox);
    }

    function addDEDButton(Context, CommentURL, DEDCallback) {
        var TradeCode, ParentID, Description, URL, DEDButton, DEDStatus, ResponseHTML;
        TradeCode = Context.querySelector("[name='trade_code']");
        TradeCode = TradeCode ? TradeCode.value : "";
        ParentID = Context.querySelector("[name='parent_id']");
        Description = Context.querySelector("[name='description']");
        URL = esgst.sg ? window.location.href.match(/(.+?)(#.+?)?$/)[1] : "/ajax.php";
        Context = Context.getElementsByClassName(esgst.sg ? "align-button-container" : "btn_actions")[0];
        Context.firstElementChild.remove();
        Context.insertAdjacentHTML("afterBegin", "<div class=\"DEDButton\"></div>");
        Context.insertAdjacentHTML("beforeEnd", "<div class=\"comment__actions action_list DEDStatus\"></div>");
        DEDButton = Context.firstElementChild;
        DEDStatus = Context.lastElementChild;
        createButton(DEDButton, "fa-send", "Submit", "fa-circle-o-notch fa-spin", "Saving...", function (Callback) {
            DEDStatus.innerHTML = "";
            if (CommentURL) {
                makeRequest(null, CommentURL, DEDStatus, function (Response) {
                    ResponseHTML = DOM.parse(Response.responseText);
                    TradeCode = esgst.sg ? "" : Response.finalUrl.match(/\/trade\/(.+?)\//)[1];
                    ParentID = ResponseHTML.getElementById(CommentURL.match(/\/comment\/(.+)/)[1]);
                    ParentID = esgst.sg ? ParentID.closest(".comment").getAttribute("data-comment-id") : ParentID.getAttribute("data-id");
                    URL = esgst.sg ? Response.finalUrl.match(/(.+?)(#.+?)?$/)[1] : "/ajax.php";
                    saveComment(TradeCode, ParentID, Description.value, URL, DEDStatus, Callback, DEDCallback);
                });
            } else {
                saveComment(TradeCode, ParentID.value, Description.value, URL, DEDStatus, Callback, DEDCallback);
            }
        }, null, true);
    }

    function loadCommentFormattingHelper(context) {
        var textAreas = context.querySelectorAll(`textarea[name='description']`);
        for (var i = 0, n = textAreas.length; i < n; ++i) {
            addCFHPanel(textAreas[i]);
        }
    }

    function addCFHPanel(Context) {
        var CFH, I, N;
        Context.insertAdjacentHTML("beforeBegin", "<div class=\"page__heading page_heading CFHPanel\"></div>");
        CFH = {
            Items: [{
                ID: "cfh_i",
                Name: "Italic",
                Icon: "fa-italic",
                Prefix: "*",
                Suffix: "*"
            }, {
                ID: "cfh_b",
                Name: "Bold",
                Icon: "fa-bold",
                Prefix: "**",
                Suffix: "**"
            }, {
                ID: "cfh_s",
                Name: "Spoiler",
                Icon: "fa-eye-slash",
                Prefix: "~",
                Suffix: "~"
            }, {
                ID: "cfh_st",
                Name: "Strikethrough",
                Icon: "fa-strikethrough",
                Prefix: "~~",
                Suffix: "~~"
            }, {
                ID: "cfh_h1",
                Name: "Heading 1",
                Icon: "fa-header",
                Text: "1",
                Prefix: "# "
            }, {
                ID: "cfh_h2",
                Name: "Heading 2",
                Icon: "fa-header",
                Text: "2",
                Prefix: "## "
            }, {
                ID: "cfh_h3",
                Name: "Heading 3",
                Icon: "fa-header",
                Text: "3",
                Prefix: "### "
            }, {
                ID: "cfh_bq",
                Name: "Blockquote",
                Icon: "fa-quote-left",
                Prefix: "> "
            }, {
                ID: "cfh_lb",
                Name: "Line Break",
                Icon: "fa-minus",
                Prefix: "\n---\n\n"
            }, {
                ID: "cfh_ol",
                Name: "Ordered List",
                Icon: "fa-list-ol",
                OrderedList: true
            }, {
                ID: "cfh_ul",
                Name: "Unordered List",
                Icon: "fa-list-ul",
                UnorderedList: true
            }, {
                ID: "cfh_ic",
                Name: "Inline Code",
                Icon: "fa-code",
                Prefix: "`",
                Suffix: "`"
            }, {
                ID: "cfh_lc",
                Name: "Line Code",
                Icon: "fa-code",
                SecondaryIcon: "fa-indent",
                Prefix: "    "
            }, {
                ID: "cfh_pc",
                Name: "Paragraph Code",
                Icon: "fa-code",
                SecondaryIcon: "fa-paragraph",
                Prefix: "```\n",
                Suffix: "\n```"
            }, {
                ID: "cfh_l",
                Name: "Link",
                Icon: "fa-globe",
                setPopout: function (Popout) {
                    var URL, Title;
                    Popout.innerHTML =
                        "URL: <input placeholder=\"http://www.example.com\" type=\"text\"/>" +
                        "Title: <input placeholder=\"Cat\" type=\"text\"/>" +
                        "<div class=\"form__saving-button btn_action white\">Add</div>";
                    URL = Popout.firstElementChild;
                    Title = URL.nextElementSibling;
                    Title.nextElementSibling.addEventListener("click", function () {
                        wrapCFHLinkImage(CFH, Title.value, URL.value);
                        URL.value = ``;
                        Title.value = ``;
                        URL.focus();
                    });
                },
                Callback: function (Popout) {
                    var Value = CFH.TextArea.value;
                    var Start = CFH.TextArea.selectionStart;
                    var End = CFH.TextArea.selectionEnd;
                    Popout.firstElementChild.nextElementSibling.value = Value.slice(Start, End);
                    window.setTimeout(function () {
                        Popout.firstElementChild.focus();
                    }, 0);
                }
            }, {
                ID: "cfh_img",
                Name: "Image",
                Icon: "fa-image",
                setPopout: function (Popout) {
                    var URL, Title;
                    Popout.innerHTML =
                        "URL: <input placeholder=\"http://www.example.com/image.jpg\" type=\"text\"/>" +
                        "Title: <input placeholder=\"Cats\" type=\"text\"/>" +
                        "<div class=\"form__saving-button btn_action white\">Add</div>";
                    URL = Popout.firstElementChild;
                    Title = URL.nextElementSibling;
                    Title.nextElementSibling.addEventListener("click", function () {
                        wrapCFHLinkImage(CFH, Title.value, URL.value, true);
                        URL.value = ``;
                        Title.value = ``;
                        URL.focus();
                    });
                },
                Callback: function (Popout) {
                    var Value = CFH.TextArea.value;
                    var Start = CFH.TextArea.selectionStart;
                    var End = CFH.TextArea.selectionEnd;
                    Popout.firstElementChild.nextElementSibling.value = Value.slice(Start, End);
                    window.setTimeout(function () {
                        Popout.firstElementChild.focus();
                    }, 0);
                }
            }, {
                ID: "cfh_t",
                Name: "Table",
                Icon: "fa-table",
                setPopup: function (Popup) {
                    var Table, InsertRow, InsertColumn, Popout;
                    Popout = Popup.Description;
                    Popout.innerHTML =
                        "<table></table>" +
                        "<div class=\"form__saving-button btn_action white\">Insert Row</div>" +
                        "<div class=\"form__saving-button btn_action white\">Insert Column</div>" +
                        "<div class=\"form__saving-button btn_action white\">Add</div>";
                    Table = Popout.firstElementChild;
                    InsertRow = Table.nextElementSibling;
                    InsertColumn = InsertRow.nextElementSibling;
                    insertCFHTableRows(4, Table);
                    insertCFHTableColumns(2, Table);
                    InsertRow.addEventListener("click", function () {
                        insertCFHTableRows(1, Table);
                    });
                    InsertColumn.addEventListener("click", function () {
                        insertCFHTableColumns(1, Table);
                    });
                    InsertColumn.nextElementSibling.addEventListener("click", function () {
                        var Rows, I, NumRows, J, NumColumns, Value, Start, End;
                        Rows = Table.rows;
                        for (I = 1, NumRows = Rows.length; I < NumRows; ++I) {
                            for (J = 1, NumColumns = Rows[0].cells.length; J < NumColumns; ++J) {
                                if (!Rows[I].cells[J].firstElementChild.value) {
                                    I = NumRows + 1;
                                    J = NumColumns + 1;
                                }
                            }
                        }
                        if ((I <= NumRows) || ((I > NumRows) && window.confirm("Some cells are empty. This might lead to unexpected results. Are you sure you want to continue?"))) {
                            Value = "";
                            for (I = 1; I < NumRows; ++I) {
                                Value += "\n";
                                for (J = 1; J < NumColumns; ++J) {
                                    Value += Rows[I].cells[J].firstElementChild.value + ((J < (NumColumns - 1)) ? " | " : "");
                                }
                            }
                            Value += "\n\n";
                            Start = CFH.TextArea.selectionStart;
                            End = CFH.TextArea.selectionEnd;
                            CFH.TextArea.value = CFH.TextArea.value.slice(0, Start) + Value + CFH.TextArea.value.slice(End);
                            CFH.TextArea.setSelectionRange(End + Value.length, End + Value.length);
                            CFH.TextArea.focus();
                            Popup.Close.click();
                        }
                    });
                }
            }, {
                ID: "cfh_e",
                Name: "Emojis",
                Icon: "fa-smile-o",
                setPopout: function (Popout) {
                    var Emojis;
                    Popout.innerHTML =
                        "<div class=\"CFHEmojis\">" + GM_getValue("Emojis") + "</div>" +
                        "<div class=\"form__saving-button btn_action white\">Select Emojis</div>";
                    Emojis = Popout.firstElementChild;
                    setCFHEmojis(Emojis, CFH);

                    Emojis.nextElementSibling.addEventListener("click", function () {
                        var Popup, I, N, Emoji, SavedEmojis;
                        Popup = createPopup(true);
                        Popup.Icon.classList.add("fa-smile-o");
                        Popup.Title.textContent = "Select emojis:";
                        Popup.Description.insertAdjacentHTML(
                            "afterBegin",
                            "<div class=\"CFHEmojis\"></div>" +
                            createDescription("Drag the emojis you want to use and drop them in the box below. Click on an emoji to remove it.") +
                            "<div class=\"global__image-outer-wrap page_heading_btn CFHEmojis\">" + GM_getValue("Emojis") + "</div>"
                        );
                        Emojis = Popup.Description.firstElementChild;
                        for (I = 0, N = CFH.Emojis.length; I < N; ++I) {
                            Emoji = CFH.Emojis[I].Emoji;
                            Emojis.insertAdjacentHTML("beforeEnd", "<span data-id=\"" + Emoji + "\" draggable=\"true\" title=\"" + CFH.Emojis[I].Title + "\">" + Emoji + "</span>");
                            Emojis.lastElementChild.addEventListener("dragstart", function (Event) {
                                Event.dataTransfer.setData("text", Event.currentTarget.getAttribute("data-id"));
                            });
                        }
                        SavedEmojis = Emojis.nextElementSibling.nextElementSibling;
                        for (I = 0, N = SavedEmojis.children.length; I < N; ++I) {
                            SavedEmojis.children[I].addEventListener("click", function (Event) {
                                Event.currentTarget.remove();
                                GM_setValue("Emojis", SavedEmojis.innerHTML);
                                Popup.reposition();
                            });
                        }
                        SavedEmojis.addEventListener("dragover", function (Event) {
                            Event.preventDefault();
                        });
                        SavedEmojis.addEventListener("drop", function (Event) {
                            var ID;
                            Event.preventDefault();
                            ID = Event.dataTransfer.getData("text").replace(/\\/g, "\\\\");
                            if (!SavedEmojis.querySelector("[data-id='" + ID + "']")) {
                                SavedEmojis.appendChild(document.querySelector("[data-id='" + ID + "']").cloneNode(true));
                                GM_setValue("Emojis", SavedEmojis.innerHTML);
                                Popup.reposition();
                                SavedEmojis.lastElementChild.addEventListener("click", function (Event) {
                                    Event.currentTarget.remove();
                                    GM_setValue("Emojis", SavedEmojis.innerHTML);
                                    Popup.reposition();
                                });
                            }
                        });
                        Popup = Popup.popUp(function () {
                            Popout.classList.add("rhHidden");
                        });
                    });
                },
                Callback: function (Popout) {
                    var Emojis;
                    Emojis = Popout.firstElementChild;
                    Emojis.innerHTML = GM_getValue("Emojis");
                    setCFHEmojis(Emojis, CFH);
                }
            }, {
                Name: "Automatic Links / Images Paste Formatting",
                Icon: "fa-paste",
                Callback: function (Context) {
                    CFH.ALIPF = Context.firstElementChild;
                    setCFHALIPF(CFH, GM_getValue("CFH_ALIPF"));
                },
                OnClick: function () {
                    setCFHALIPF(CFH);
                }
            }, {
                ID: "cfh_ge",
                Name: "Giveaway Encrypter",
                Icon: "fa-star",
                setPopout: function (Popout) {
                    var Code;
                    Popout.innerHTML =
                        "Giveaway Code: <input placeholder=\"XXXXX\" type=\"text\"/>" +
                        "<div class=\"form__saving-button btn_action white\">Add</div>";
                    Code = Popout.firstElementChild;
                    Code.nextElementSibling.addEventListener("click", function () {
                        var encodedCode = encryptGiveaway(Code.value);
                        wrapCFHLinkImage(CFH, ``, `ESGST-${encodedCode}`);
                        Code.value = ``;
                        Code.focus();
                    });
                },
                Callback: function (Popout) {
                    var Value = CFH.TextArea.value;
                    var Start = CFH.TextArea.selectionStart;
                    var End = CFH.TextArea.selectionEnd;
                    Popout.firstElementChild.nextElementSibling.value = Value.slice(Start, End);
                    window.setTimeout(function () {
                        Popout.firstElementChild.focus();
                    }, 0);
                }
            }],
            Panel: Context.previousElementSibling,
            TextArea: Context,
            Emojis: [ //Top emojis credit to https://greasyfork.org/scripts/21607-steamgifts-comment-formatting
                {
                    Emoji: "&#xAF;&#92;&#92;&#95;&#40;&#x30C4;&#41;&#95;&#47;&#xAF;",
                    Title: ""
                }, {
                    Emoji: "&#40; &#x361;&#xB0; &#x35C;&#x296; &#x361;&#xB0;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#40; &#x361;&#x2299; &#x35C;&#x296; &#x361;&#x2299;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#x30CE;&#xCA0;&#x76CA;&#xCA0;&#41;&#x30CE;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#x256F;&#xB0;&#x25A1;&#xB0;&#xFF09;&#x256F;&#xFE35; &#x253B;&#x2501;&#x253B;",
                    Title: ""
                }, {
                    Emoji: "&#x252C;&#x2500;&#x252C;&#x30CE;&#40; &#xBA; &#95; &#xBA;&#x30CE;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#x10DA;&#40;&#xCA0;&#x76CA;&#xCA0;&#x10DA;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#x25D5;&#x203F;-&#41;&#x270C;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#xFF61;&#x25D5;&#x203F;&#x25D5;&#xFF61;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#x25D1;&#x203F;&#x25D0;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#x25D4;&#95;&#x25D4;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#x2022;&#x203F;&#x2022;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#xCA0;&#95;&#xCA0;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#xAC;&#xFF64;&#xAC;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#x2500;&#x203F;&#x203F;&#x2500;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#xCA5;&#xFE4F;&#xCA5;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#xCA5;&#x2038;&#xCA5;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#x2310;&#x25A0;&#95;&#x25A0;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#x25B0;&#x2D8;&#x25E1;&#x2D8;&#x25B0;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#x4E41;&#40; &#x25D4; &#xC6A;&#x25D4;&#41;&#x310F;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#xE07; &#x360;&#xB0; &#x35F;&#x296; &#x361;&#xB0;&#41;&#xE07;",
                    Title: ""
                }, {
                    Emoji: "&#x3B6;&#xF3C;&#x19F;&#x346;&#x644;&#x35C;&#x19F;&#x346;&#xF3D;&#x1D98;",
                    Title: ""
                }, {
                    Emoji: "&#x295;&#x2022;&#x1D25;&#x2022;&#x294;",
                    Title: ""
                }, {
                    Emoji: "&#40; &#x35D;&#xB0; &#x35C;&#x296;&#x361;&#xB0;&#41;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#47;&#xFF9F;&#x414;&#xFF9F;&#41;&#47;",
                    Title: ""
                }, {
                    Emoji: "&#xB67;&#xF3C;&#xCA0;&#x76CA;&#xCA0;&#xF3D;&#xB68;",
                    Title: ""
                }, {
                    Emoji: "&#40;&#xE07; &#x2022;&#x300;&#95;&#x2022;&#x301;&#41;&#xE07;",
                    Title: ""
                }, {
                    Emoji: "&#x1F600",
                    Title: "Grinning Face"
                }, {
                    Emoji: "&#x1F601",
                    Title: "Grinning Face With Smiling Eyes"
                }, {
                    Emoji: "&#x1F602",
                    Title: "Face With Tears Of Joy"
                }, {
                    Emoji: "&#x1F923",
                    Title: "Rolling On The Floor Laughing"
                }, {
                    Emoji: "&#x1F603",
                    Title: "Smiling Face With Open Mouth"
                }, {
                    Emoji: "&#x1F604",
                    Title: "Smiling Face With Open Mouth & Smiling Eyes"
                }, {
                    Emoji: "&#x1F605",
                    Title: "Smiling Face With Open Mouth & Cold Sweat"
                }, {
                    Emoji: "&#x1F606",
                    Title: "Smiling Face With Open Mouth & Closed Eyes"
                }, {
                    Emoji: "&#x1F609",
                    Title: "Winking Face"
                }, {
                    Emoji: "&#x1F60A",
                    Title: "Smiling Face With Smiling Eyes"
                }, {
                    Emoji: "&#x1F60B",
                    Title: "Face Savouring Delicious Food"
                }, {
                    Emoji: "&#x1F60E",
                    Title: "Smiling Face With Sunglasses"
                }, {
                    Emoji: "&#x1F60D",
                    Title: "Smiling Face With Heart-Eyes"
                }, {
                    Emoji: "&#x1F618",
                    Title: "Face Blowing A Kiss"
                }, {
                    Emoji: "&#x1F617",
                    Title: "Kissing Face"
                }, {
                    Emoji: "&#x1F619",
                    Title: "Kissing Face With Smiling Eyes"
                }, {
                    Emoji: "&#x1F61A",
                    Title: "Kissing Face With Closed Eyes"
                }, {
                    Emoji: "&#x263A",
                    Title: "Smiling Face"
                }, {
                    Emoji: "&#x1F642",
                    Title: "Slightly Smiling Face"
                }, {
                    Emoji: "&#x1F917",
                    Title: "Hugging Face"
                }, {
                    Emoji: "&#x1F914",
                    Title: "Thinking Face"
                }, {
                    Emoji: "&#x1F610",
                    Title: "Neutral Face"
                }, {
                    Emoji: "&#x1F611",
                    Title: "Expressionless Face"
                }, {
                    Emoji: "&#x1F636",
                    Title: "Face Without Mouth"
                }, {
                    Emoji: "&#x1F644",
                    Title: "Face With Rolling Eyes"
                }, {
                    Emoji: "&#x1F60F",
                    Title: "Smirking Face"
                }, {
                    Emoji: "&#x1F623",
                    Title: "Persevering Face"
                }, {
                    Emoji: "&#x1F625",
                    Title: "Disappointed But Relieved Face"
                }, {
                    Emoji: "&#x1F62E",
                    Title: "Face With Open Mouth"
                }, {
                    Emoji: "&#x1F910",
                    Title: "Zipper-Mouth Face"
                }, {
                    Emoji: "&#x1F62F",
                    Title: "Hushed Face"
                }, {
                    Emoji: "&#x1F62A",
                    Title: "Sleepy Face"
                }, {
                    Emoji: "&#x1F62B",
                    Title: "Tired Face"
                }, {
                    Emoji: "&#x1F634",
                    Title: "Sleeping Face"
                }, {
                    Emoji: "&#x1F60C",
                    Title: "Relieved Face"
                }, {
                    Emoji: "&#x1F913",
                    Title: "Nerd Face"
                }, {
                    Emoji: "&#x1F61B",
                    Title: "Face With Stuck-Out Tongue"
                }, {
                    Emoji: "&#x1F61C",
                    Title: "Face With Stuck-Out Tongue & Winking Eye"
                }, {
                    Emoji: "&#x1F61D",
                    Title: "Face With Stuck-Out Tongue & Closed Eyes"
                }, {
                    Emoji: "&#x1F924",
                    Title: "Drooling Face"
                }, {
                    Emoji: "&#x1F612",
                    Title: "Unamused Face"
                }, {
                    Emoji: "&#x1F613",
                    Title: "Face With Cold Sweat"
                }, {
                    Emoji: "&#x1F614",
                    Title: "Pensive Face"
                }, {
                    Emoji: "&#x1F615",
                    Title: "Confused Face"
                }, {
                    Emoji: "&#x1F643",
                    Title: "Upside-Down Face"
                }, {
                    Emoji: "&#x1F911",
                    Title: "Money-Mouth Face"
                }, {
                    Emoji: "&#x1F632",
                    Title: "Astonished Face"
                }, {
                    Emoji: "&#x2639",
                    Title: "Frowning Face"
                }, {
                    Emoji: "&#x1F641",
                    Title: "Slightly Frowning Face"
                }, {
                    Emoji: "&#x1F616",
                    Title: "Confounded Face"
                }, {
                    Emoji: "&#x1F61E",
                    Title: "Disappointed Face"
                }, {
                    Emoji: "&#x1F61F",
                    Title: "Worried Face"
                }, {
                    Emoji: "&#x1F624",
                    Title: "Face With Steam From Nose"
                }, {
                    Emoji: "&#x1F622",
                    Title: "Crying Face"
                }, {
                    Emoji: "&#x1F62D",
                    Title: "Loudly Crying Face"
                }, {
                    Emoji: "&#x1F626",
                    Title: "Frowning Face With Open Mouth"
                }, {
                    Emoji: "&#x1F627",
                    Title: "Anguished Face"
                }, {
                    Emoji: "&#x1F628",
                    Title: "Fearful Face"
                }, {
                    Emoji: "&#x1F629",
                    Title: "Weary Face"
                }, {
                    Emoji: "&#x1F62C",
                    Title: "Grimacing Face"
                }, {
                    Emoji: "&#x1F630",
                    Title: "Face With Open Mouth & Cold Sweat"
                }, {
                    Emoji: "&#x1F631",
                    Title: "Face Screaming In Fear"
                }, {
                    Emoji: "&#x1F633",
                    Title: "Flushed Face"
                }, {
                    Emoji: "&#x1F635",
                    Title: "Dizzy Face"
                }, {
                    Emoji: "&#x1F621",
                    Title: "Pouting Face"
                }, {
                    Emoji: "&#x1F620",
                    Title: "Angry Face"
                }, {
                    Emoji: "&#x1F607",
                    Title: "Smiling Face With Halo"
                }, {
                    Emoji: "&#x1F920",
                    Title: "Cowboy Hat Face"
                }, {
                    Emoji: "&#x1F921",
                    Title: "Clown Face"
                }, {
                    Emoji: "&#x1F925",
                    Title: "Lying Face"
                }, {
                    Emoji: "&#x1F637",
                    Title: "Face With Medical Mask"
                }, {
                    Emoji: "&#x1F912",
                    Title: "Face With Thermometer"
                }, {
                    Emoji: "&#x1F915",
                    Title: "Face With Head-Bandage"
                }, {
                    Emoji: "&#x1F922",
                    Title: "Nauseated Face"
                }, {
                    Emoji: "&#x1F927",
                    Title: "Sneezing Face"
                }, {
                    Emoji: "&#x1F608",
                    Title: "Smiling Face With Horns"
                }, {
                    Emoji: "&#x1F47F",
                    Title: "Angry Face With Horns"
                }, {
                    Emoji: "&#x1F479",
                    Title: "Ogre"
                }, {
                    Emoji: "&#x1F47A",
                    Title: "Goblin"
                }, {
                    Emoji: "&#x1F480",
                    Title: "Skull"
                }, {
                    Emoji: "&#x2620",
                    Title: "Skull And Crossbones"
                }, {
                    Emoji: "&#x1F47B",
                    Title: "Ghost"
                }, {
                    Emoji: "&#x1F47D",
                    Title: "Alien"
                }, {
                    Emoji: "&#x1F47E",
                    Title: "Alien Monster"
                }, {
                    Emoji: "&#x1F916",
                    Title: "Robot Face"
                }, {
                    Emoji: "&#x1F4A9",
                    Title: "Pile Of Poo"
                }, {
                    Emoji: "&#x1F63A",
                    Title: "Smiling Cat Face With Open Mouth"
                }, {
                    Emoji: "&#x1F638",
                    Title: "Grinning Cat Face With Smiling Eyes"
                }, {
                    Emoji: "&#x1F639",
                    Title: "Cat Face With Tears Of Joy"
                }, {
                    Emoji: "&#x1F63B",
                    Title: "Smiling Cat Face With Heart-Eyes"
                }, {
                    Emoji: "&#x1F63C",
                    Title: "Cat Face With Wry Smile"
                }, {
                    Emoji: "&#x1F63D",
                    Title: "Kissing Cat Face With Closed Eyes"
                }, {
                    Emoji: "&#x1F640",
                    Title: "Weary Cat Face"
                }, {
                    Emoji: "&#x1F63F",
                    Title: "Crying Cat Face"
                }, {
                    Emoji: "&#x1F63E",
                    Title: "Pouting Cat Face"
                }, {
                    Emoji: "&#x1F648",
                    Title: "See-No-Evil Monkey"
                }, {
                    Emoji: "&#x1F649",
                    Title: "Hear-No-Evil Monkey"
                }, {
                    Emoji: "&#x1F64A",
                    Title: "Speak-No-Evil Monkey"
                }, {
                    Emoji: "&#x1F466",
                    Title: "Boy"
                }, {
                    Emoji: "&#x1F466&#x1F3FB",
                    Title: "Boy: Light Skin Tone"
                }, {
                    Emoji: "&#x1F466&#x1F3FC",
                    Title: "Boy: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F466&#x1F3FD",
                    Title: "Boy: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F466&#x1F3FE",
                    Title: "Boy: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F466&#x1F3FF",
                    Title: "Boy: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F467",
                    Title: "Girl"
                }, {
                    Emoji: "&#x1F467&#x1F3FB",
                    Title: "Girl: Light Skin Tone"
                }, {
                    Emoji: "&#x1F467&#x1F3FC",
                    Title: "Girl: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F467&#x1F3FD",
                    Title: "Girl: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F467&#x1F3FE",
                    Title: "Girl: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F467&#x1F3FF",
                    Title: "Girl: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468",
                    Title: "Man"
                }, {
                    Emoji: "&#x1F468&#x1F3FB",
                    Title: "Man: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC",
                    Title: "Man: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD",
                    Title: "Man: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE",
                    Title: "Man: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF",
                    Title: "Man: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469",
                    Title: "Woman"
                }, {
                    Emoji: "&#x1F469&#x1F3FB",
                    Title: "Woman: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC",
                    Title: "Woman: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD",
                    Title: "Woman: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE",
                    Title: "Woman: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF",
                    Title: "Woman: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F474",
                    Title: "Old Man"
                }, {
                    Emoji: "&#x1F474&#x1F3FB",
                    Title: "Old Man: Light Skin Tone"
                }, {
                    Emoji: "&#x1F474&#x1F3FC",
                    Title: "Old Man: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F474&#x1F3FD",
                    Title: "Old Man: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F474&#x1F3FE",
                    Title: "Old Man: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F474&#x1F3FF",
                    Title: "Old Man: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F475",
                    Title: "Old Woman"
                }, {
                    Emoji: "&#x1F475&#x1F3FB",
                    Title: "Old Woman: Light Skin Tone"
                }, {
                    Emoji: "&#x1F475&#x1F3FC",
                    Title: "Old Woman: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F475&#x1F3FD",
                    Title: "Old Woman: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F475&#x1F3FE",
                    Title: "Old Woman: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F475&#x1F3FF",
                    Title: "Old Woman: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F476",
                    Title: "Baby"
                }, {
                    Emoji: "&#x1F476&#x1F3FB",
                    Title: "Baby: Light Skin Tone"
                }, {
                    Emoji: "&#x1F476&#x1F3FC",
                    Title: "Baby: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F476&#x1F3FD",
                    Title: "Baby: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F476&#x1F3FE",
                    Title: "Baby: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F476&#x1F3FF",
                    Title: "Baby: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F47C",
                    Title: "Baby Angel"
                }, {
                    Emoji: "&#x1F47C&#x1F3FB",
                    Title: "Baby Angel: Light Skin Tone"
                }, {
                    Emoji: "&#x1F47C&#x1F3FC",
                    Title: "Baby Angel: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F47C&#x1F3FD",
                    Title: "Baby Angel: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F47C&#x1F3FE",
                    Title: "Baby Angel: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F47C&#x1F3FF",
                    Title: "Baby Angel: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x2695&#xFE0F",
                    Title: "Man Health Worker"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x2695&#xFE0F",
                    Title: "Man Health Worker: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x2695&#xFE0F",
                    Title: "Man Health Worker: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x2695&#xFE0F",
                    Title: "Man Health Worker: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x2695&#xFE0F",
                    Title: "Man Health Worker: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x2695&#xFE0F",
                    Title: "Man Health Worker: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x2695&#xFE0F",
                    Title: "Woman Health Worker"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x2695&#xFE0F",
                    Title: "Woman Health Worker: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x2695&#xFE0F",
                    Title: "Woman Health Worker: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x2695&#xFE0F",
                    Title: "Woman Health Worker: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x2695&#xFE0F",
                    Title: "Woman Health Worker: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x2695&#xFE0F",
                    Title: "Woman Health Worker: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F393",
                    Title: "Man Student"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F393",
                    Title: "Man Student: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F393",
                    Title: "Man Student: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F393",
                    Title: "Man Student: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F393",
                    Title: "Man Student: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F393",
                    Title: "Man Student: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F393",
                    Title: "Woman Student"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F393",
                    Title: "Woman Student: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F393",
                    Title: "Woman Student: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F393",
                    Title: "Woman Student: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F393",
                    Title: "Woman Student: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F393",
                    Title: "Woman Student: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F3EB",
                    Title: "Man Teacher"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F3EB",
                    Title: "Man Teacher: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F3EB",
                    Title: "Man Teacher: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F3EB",
                    Title: "Man Teacher: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F3EB",
                    Title: "Man Teacher: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F3EB",
                    Title: "Man Teacher: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F3EB",
                    Title: "Woman Teacher"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F3EB",
                    Title: "Woman Teacher: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F3EB",
                    Title: "Woman Teacher: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F3EB",
                    Title: "Woman Teacher: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F3EB",
                    Title: "Woman Teacher: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F3EB",
                    Title: "Woman Teacher: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x2696&#xFE0F",
                    Title: "Man Judge"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x2696&#xFE0F",
                    Title: "Man Judge: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x2696&#xFE0F",
                    Title: "Man Judge: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x2696&#xFE0F",
                    Title: "Man Judge: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x2696&#xFE0F",
                    Title: "Man Judge: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x2696&#xFE0F",
                    Title: "Man Judge: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x2696&#xFE0F",
                    Title: "Woman Judge"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x2696&#xFE0F",
                    Title: "Woman Judge: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x2696&#xFE0F",
                    Title: "Woman Judge: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x2696&#xFE0F",
                    Title: "Woman Judge: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x2696&#xFE0F",
                    Title: "Woman Judge: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x2696&#xFE0F",
                    Title: "Woman Judge: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F33E",
                    Title: "Man Farmer"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F33E",
                    Title: "Man Farmer: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F33E",
                    Title: "Man Farmer: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F33E",
                    Title: "Man Farmer: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F33E",
                    Title: "Man Farmer: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F33E",
                    Title: "Man Farmer: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F33E",
                    Title: "Woman Farmer"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F33E",
                    Title: "Woman Farmer: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F33E",
                    Title: "Woman Farmer: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F33E",
                    Title: "Woman Farmer: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F33E",
                    Title: "Woman Farmer: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F33E",
                    Title: "Woman Farmer: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F373",
                    Title: "Man Cook"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F373",
                    Title: "Man Cook: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F373",
                    Title: "Man Cook: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F373",
                    Title: "Man Cook: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F373",
                    Title: "Man Cook: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F373",
                    Title: "Man Cook: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F373",
                    Title: "Woman Cook"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F373",
                    Title: "Woman Cook: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F373",
                    Title: "Woman Cook: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F373",
                    Title: "Woman Cook: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F373",
                    Title: "Woman Cook: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F373",
                    Title: "Woman Cook: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F527",
                    Title: "Man Mechanic"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F527",
                    Title: "Man Mechanic: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F527",
                    Title: "Man Mechanic: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F527",
                    Title: "Man Mechanic: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F527",
                    Title: "Man Mechanic: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F527",
                    Title: "Man Mechanic: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F527",
                    Title: "Woman Mechanic"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F527",
                    Title: "Woman Mechanic: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F527",
                    Title: "Woman Mechanic: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F527",
                    Title: "Woman Mechanic: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F527",
                    Title: "Woman Mechanic: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F527",
                    Title: "Woman Mechanic: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F3ED",
                    Title: "Man Factory Worker"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F3ED",
                    Title: "Man Factory Worker: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F3ED",
                    Title: "Man Factory Worker: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F3ED",
                    Title: "Man Factory Worker: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F3ED",
                    Title: "Man Factory Worker: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F3ED",
                    Title: "Man Factory Worker: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F3ED",
                    Title: "Woman Factory Worker"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F3ED",
                    Title: "Woman Factory Worker: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F3ED",
                    Title: "Woman Factory Worker: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F3ED",
                    Title: "Woman Factory Worker: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F3ED",
                    Title: "Woman Factory Worker: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F3ED",
                    Title: "Woman Factory Worker: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F4BC",
                    Title: "Man Office Worker"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F4BC",
                    Title: "Man Office Worker: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F4BC",
                    Title: "Man Office Worker: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F4BC",
                    Title: "Man Office Worker: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F4BC",
                    Title: "Man Office Worker: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F4BC",
                    Title: "Man Office Worker: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F4BC",
                    Title: "Woman Office Worker"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F4BC",
                    Title: "Woman Office Worker: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F4BC",
                    Title: "Woman Office Worker: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F4BC",
                    Title: "Woman Office Worker: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F4BC",
                    Title: "Woman Office Worker: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F4BC",
                    Title: "Woman Office Worker: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F52C",
                    Title: "Man Scientist"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F52C",
                    Title: "Man Scientist: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F52C",
                    Title: "Man Scientist: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F52C",
                    Title: "Man Scientist: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F52C",
                    Title: "Man Scientist: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F52C",
                    Title: "Man Scientist: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F52C",
                    Title: "Woman Scientist"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F52C",
                    Title: "Woman Scientist: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F52C",
                    Title: "Woman Scientist: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F52C",
                    Title: "Woman Scientist: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F52C",
                    Title: "Woman Scientist: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F52C",
                    Title: "Woman Scientist: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F4BB",
                    Title: "Man Technologist"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F4BB",
                    Title: "Man Technologist: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F4BB",
                    Title: "Man Technologist: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F4BB",
                    Title: "Man Technologist: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F4BB",
                    Title: "Man Technologist: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F4BB",
                    Title: "Man Technologist: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F4BB",
                    Title: "Woman Technologist"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F4BB",
                    Title: "Woman Technologist: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F4BB",
                    Title: "Woman Technologist: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F4BB",
                    Title: "Woman Technologist: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F4BB",
                    Title: "Woman Technologist: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F4BB",
                    Title: "Woman Technologist: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F3A4",
                    Title: "Man Singer"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F3A4",
                    Title: "Man Singer: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F3A4",
                    Title: "Man Singer: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F3A4",
                    Title: "Man Singer: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F3A4",
                    Title: "Man Singer: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F3A4",
                    Title: "Man Singer: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F3A4",
                    Title: "Woman Singer"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F3A4",
                    Title: "Woman Singer: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F3A4",
                    Title: "Woman Singer: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F3A4",
                    Title: "Woman Singer: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F3A4",
                    Title: "Woman Singer: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F3A4",
                    Title: "Woman Singer: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F3A8",
                    Title: "Man Artist"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F3A8",
                    Title: "Man Artist: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F3A8",
                    Title: "Man Artist: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F3A8",
                    Title: "Man Artist: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F3A8",
                    Title: "Man Artist: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F3A8",
                    Title: "Man Artist: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F3A8",
                    Title: "Woman Artist"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F3A8",
                    Title: "Woman Artist: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F3A8",
                    Title: "Woman Artist: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F3A8",
                    Title: "Woman Artist: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F3A8",
                    Title: "Woman Artist: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F3A8",
                    Title: "Woman Artist: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x2708&#xFE0F",
                    Title: "Man Pilot"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x2708&#xFE0F",
                    Title: "Man Pilot: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x2708&#xFE0F",
                    Title: "Man Pilot: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x2708&#xFE0F",
                    Title: "Man Pilot: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x2708&#xFE0F",
                    Title: "Man Pilot: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x2708&#xFE0F",
                    Title: "Man Pilot: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x2708&#xFE0F",
                    Title: "Woman Pilot"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x2708&#xFE0F",
                    Title: "Woman Pilot: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x2708&#xFE0F",
                    Title: "Woman Pilot: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x2708&#xFE0F",
                    Title: "Woman Pilot: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x2708&#xFE0F",
                    Title: "Woman Pilot: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x2708&#xFE0F",
                    Title: "Woman Pilot: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F680",
                    Title: "Man Astronaut"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F680",
                    Title: "Man Astronaut: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F680",
                    Title: "Man Astronaut: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F680",
                    Title: "Man Astronaut: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F680",
                    Title: "Man Astronaut: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F680",
                    Title: "Man Astronaut: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F680",
                    Title: "Woman Astronaut"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F680",
                    Title: "Woman Astronaut: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F680",
                    Title: "Woman Astronaut: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F680",
                    Title: "Woman Astronaut: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F680",
                    Title: "Woman Astronaut: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F680",
                    Title: "Woman Astronaut: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F692",
                    Title: "Man Firefighter"
                }, {
                    Emoji: "&#x1F468&#x1F3FB&#x200D&#x1F692",
                    Title: "Man Firefighter: Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FC&#x200D&#x1F692",
                    Title: "Man Firefighter: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FD&#x200D&#x1F692",
                    Title: "Man Firefighter: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FE&#x200D&#x1F692",
                    Title: "Man Firefighter: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F468&#x1F3FF&#x200D&#x1F692",
                    Title: "Man Firefighter: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F692",
                    Title: "Woman Firefighter"
                }, {
                    Emoji: "&#x1F469&#x1F3FB&#x200D&#x1F692",
                    Title: "Woman Firefighter: Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FC&#x200D&#x1F692",
                    Title: "Woman Firefighter: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FD&#x200D&#x1F692",
                    Title: "Woman Firefighter: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FE&#x200D&#x1F692",
                    Title: "Woman Firefighter: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F469&#x1F3FF&#x200D&#x1F692",
                    Title: "Woman Firefighter: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F46E",
                    Title: "Police Officer"
                }, {
                    Emoji: "&#x1F46E&#x1F3FB",
                    Title: "Police Officer: Light Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x1F3FC",
                    Title: "Police Officer: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x1F3FD",
                    Title: "Police Officer: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x1F3FE",
                    Title: "Police Officer: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x1F3FF",
                    Title: "Police Officer: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x200D&#x2642&#xFE0F",
                    Title: "Man Police Officer"
                }, {
                    Emoji: "&#x1F46E&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Police Officer: Light Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Police Officer: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Police Officer: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Police Officer: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Police Officer: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x200D&#x2640&#xFE0F",
                    Title: "Woman Police Officer"
                }, {
                    Emoji: "&#x1F46E&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Police Officer: Light Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Police Officer: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Police Officer: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Police Officer: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F46E&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Police Officer: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F575",
                    Title: "Detective"
                }, {
                    Emoji: "&#x1F575&#x1F3FB",
                    Title: "Detective: Light Skin Tone"
                }, {
                    Emoji: "&#x1F575&#x1F3FC",
                    Title: "Detective: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F575&#x1F3FD",
                    Title: "Detective: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F575&#x1F3FE",
                    Title: "Detective: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F575&#x1F3FF",
                    Title: "Detective: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F575&#xFE0F&#x200D&#x2642&#xFE0F",
                    Title: "Man Detective"
                }, {
                    Emoji: "&#x1F575&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Detective: Light Skin Tone"
                }, {
                    Emoji: "&#x1F575&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Detective: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F575&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Detective: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F575&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Detective: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F575&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Detective: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F575&#xFE0F&#x200D&#x2640&#xFE0F",
                    Title: "Woman Detective"
                }, {
                    Emoji: "&#x1F575&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Detective: Light Skin Tone"
                }, {
                    Emoji: "&#x1F575&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Detective: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F575&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Detective: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F575&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Detective: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F575&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Detective: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F482",
                    Title: "Guard"
                }, {
                    Emoji: "&#x1F482&#x1F3FB",
                    Title: "Guard: Light Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x1F3FC",
                    Title: "Guard: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x1F3FD",
                    Title: "Guard: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x1F3FE",
                    Title: "Guard: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x1F3FF",
                    Title: "Guard: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x200D&#x2642&#xFE0F",
                    Title: "Man Guard"
                }, {
                    Emoji: "&#x1F482&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Guard: Light Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Guard: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Guard: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Guard: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Guard: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x200D&#x2640&#xFE0F",
                    Title: "Woman Guard"
                }, {
                    Emoji: "&#x1F482&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Guard: Light Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Guard: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Guard: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Guard: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F482&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Guard: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F477",
                    Title: "Construction Worker"
                }, {
                    Emoji: "&#x1F477&#x1F3FB",
                    Title: "Construction Worker: Light Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x1F3FC",
                    Title: "Construction Worker: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x1F3FD",
                    Title: "Construction Worker: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x1F3FE",
                    Title: "Construction Worker: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x1F3FF",
                    Title: "Construction Worker: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x200D&#x2642&#xFE0F",
                    Title: "Man Construction Worker"
                }, {
                    Emoji: "&#x1F477&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Construction Worker: Light Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Construction Worker: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Construction Worker: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Construction Worker: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Construction Worker: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x200D&#x2640&#xFE0F",
                    Title: "Woman Construction Worker"
                }, {
                    Emoji: "&#x1F477&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Construction Worker: Light Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Construction Worker: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Construction Worker: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Construction Worker: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F477&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Construction Worker: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F473",
                    Title: "Person Wearing Turban"
                }, {
                    Emoji: "&#x1F473&#x1F3FB",
                    Title: "Person Wearing Turban: Light Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x1F3FC",
                    Title: "Person Wearing Turban: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x1F3FD",
                    Title: "Person Wearing Turban: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x1F3FE",
                    Title: "Person Wearing Turban: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x1F3FF",
                    Title: "Person Wearing Turban: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x200D&#x2642&#xFE0F",
                    Title: "Man Wearing Turban"
                }, {
                    Emoji: "&#x1F473&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Wearing Turban: Light Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Wearing Turban: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Wearing Turban: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Wearing Turban: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Wearing Turban: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x200D&#x2640&#xFE0F",
                    Title: "Woman Wearing Turban"
                }, {
                    Emoji: "&#x1F473&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Wearing Turban: Light Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Wearing Turban: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Wearing Turban: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Wearing Turban: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F473&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Wearing Turban: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F471",
                    Title: "Blond-Haired Person"
                }, {
                    Emoji: "&#x1F471&#x1F3FB",
                    Title: "Blond-Haired Person: Light Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x1F3FC",
                    Title: "Blond-Haired Person: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x1F3FD",
                    Title: "Blond-Haired Person: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x1F3FE",
                    Title: "Blond-Haired Person: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x1F3FF",
                    Title: "Blond-Haired Person: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x200D&#x2642&#xFE0F",
                    Title: "Blond-Haired Man"
                }, {
                    Emoji: "&#x1F471&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Blond-Haired Man: Light Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Blond-Haired Man: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Blond-Haired Man: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Blond-Haired Man: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Blond-Haired Man: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x200D&#x2640&#xFE0F",
                    Title: "Blond-Haired Woman"
                }, {
                    Emoji: "&#x1F471&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Blond-Haired Woman: Light Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Blond-Haired Woman: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Blond-Haired Woman: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Blond-Haired Woman: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F471&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Blond-Haired Woman: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F385",
                    Title: "Santa Claus"
                }, {
                    Emoji: "&#x1F385&#x1F3FB",
                    Title: "Santa Claus: Light Skin Tone"
                }, {
                    Emoji: "&#x1F385&#x1F3FC",
                    Title: "Santa Claus: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F385&#x1F3FD",
                    Title: "Santa Claus: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F385&#x1F3FE",
                    Title: "Santa Claus: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F385&#x1F3FF",
                    Title: "Santa Claus: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F936",
                    Title: "Mrs. Claus"
                }, {
                    Emoji: "&#x1F936&#x1F3FB",
                    Title: "Mrs. Claus: Light Skin Tone"
                }, {
                    Emoji: "&#x1F936&#x1F3FC",
                    Title: "Mrs. Claus: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F936&#x1F3FD",
                    Title: "Mrs. Claus: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F936&#x1F3FE",
                    Title: "Mrs. Claus: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F936&#x1F3FF",
                    Title: "Mrs. Claus: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F478",
                    Title: "Princess"
                }, {
                    Emoji: "&#x1F478&#x1F3FB",
                    Title: "Princess: Light Skin Tone"
                }, {
                    Emoji: "&#x1F478&#x1F3FC",
                    Title: "Princess: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F478&#x1F3FD",
                    Title: "Princess: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F478&#x1F3FE",
                    Title: "Princess: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F478&#x1F3FF",
                    Title: "Princess: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F934",
                    Title: "Prince"
                }, {
                    Emoji: "&#x1F934&#x1F3FB",
                    Title: "Prince: Light Skin Tone"
                }, {
                    Emoji: "&#x1F934&#x1F3FC",
                    Title: "Prince: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F934&#x1F3FD",
                    Title: "Prince: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F934&#x1F3FE",
                    Title: "Prince: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F934&#x1F3FF",
                    Title: "Prince: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F470",
                    Title: "Bride With Veil"
                }, {
                    Emoji: "&#x1F470&#x1F3FB",
                    Title: "Bride With Veil: Light Skin Tone"
                }, {
                    Emoji: "&#x1F470&#x1F3FC",
                    Title: "Bride With Veil: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F470&#x1F3FD",
                    Title: "Bride With Veil: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F470&#x1F3FE",
                    Title: "Bride With Veil: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F470&#x1F3FF",
                    Title: "Bride With Veil: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F935",
                    Title: "Man In Tuxedo"
                }, {
                    Emoji: "&#x1F935&#x1F3FB",
                    Title: "Man In Tuxedo: Light Skin Tone"
                }, {
                    Emoji: "&#x1F935&#x1F3FC",
                    Title: "Man In Tuxedo: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F935&#x1F3FD",
                    Title: "Man In Tuxedo: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F935&#x1F3FE",
                    Title: "Man In Tuxedo: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F935&#x1F3FF",
                    Title: "Man In Tuxedo: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F930",
                    Title: "Pregnant Woman"
                }, {
                    Emoji: "&#x1F930&#x1F3FB",
                    Title: "Pregnant Woman: Light Skin Tone"
                }, {
                    Emoji: "&#x1F930&#x1F3FC",
                    Title: "Pregnant Woman: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F930&#x1F3FD",
                    Title: "Pregnant Woman: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F930&#x1F3FE",
                    Title: "Pregnant Woman: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F930&#x1F3FF",
                    Title: "Pregnant Woman: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F472",
                    Title: "Man With Chinese Cap"
                }, {
                    Emoji: "&#x1F472&#x1F3FB",
                    Title: "Man With Chinese Cap: Light Skin Tone"
                }, {
                    Emoji: "&#x1F472&#x1F3FC",
                    Title: "Man With Chinese Cap: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F472&#x1F3FD",
                    Title: "Man With Chinese Cap: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F472&#x1F3FE",
                    Title: "Man With Chinese Cap: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F472&#x1F3FF",
                    Title: "Man With Chinese Cap: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64D",
                    Title: "Person Frowning"
                }, {
                    Emoji: "&#x1F64D&#x1F3FB",
                    Title: "Person Frowning: Light Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x1F3FC",
                    Title: "Person Frowning: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x1F3FD",
                    Title: "Person Frowning: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x1F3FE",
                    Title: "Person Frowning: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x1F3FF",
                    Title: "Person Frowning: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x200D&#x2642&#xFE0F",
                    Title: "Man Frowning"
                }, {
                    Emoji: "&#x1F64D&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Frowning: Light Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Frowning: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Frowning: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Frowning: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Frowning: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x200D&#x2640&#xFE0F",
                    Title: "Woman Frowning"
                }, {
                    Emoji: "&#x1F64D&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Frowning: Light Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Frowning: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Frowning: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Frowning: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64D&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Frowning: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64E",
                    Title: "Person Pouting"
                }, {
                    Emoji: "&#x1F64E&#x1F3FB",
                    Title: "Person Pouting: Light Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x1F3FC",
                    Title: "Person Pouting: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x1F3FD",
                    Title: "Person Pouting: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x1F3FE",
                    Title: "Person Pouting: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x1F3FF",
                    Title: "Person Pouting: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x200D&#x2642&#xFE0F",
                    Title: "Man Pouting"
                }, {
                    Emoji: "&#x1F64E&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Pouting: Light Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Pouting: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Pouting: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Pouting: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Pouting: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x200D&#x2640&#xFE0F",
                    Title: "Woman Pouting"
                }, {
                    Emoji: "&#x1F64E&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Pouting: Light Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Pouting: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Pouting: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Pouting: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64E&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Pouting: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F645",
                    Title: "Person Gesturing NO"
                }, {
                    Emoji: "&#x1F645&#x1F3FB",
                    Title: "Person Gesturing NO: Light Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x1F3FC",
                    Title: "Person Gesturing NO: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x1F3FD",
                    Title: "Person Gesturing NO: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x1F3FE",
                    Title: "Person Gesturing NO: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x1F3FF",
                    Title: "Person Gesturing NO: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x200D&#x2642&#xFE0F",
                    Title: "Man Gesturing NO"
                }, {
                    Emoji: "&#x1F645&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Gesturing NO: Light Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Gesturing NO: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Gesturing NO: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Gesturing NO: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Gesturing NO: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x200D&#x2640&#xFE0F",
                    Title: "Woman Gesturing NO"
                }, {
                    Emoji: "&#x1F645&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Gesturing NO: Light Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Gesturing NO: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Gesturing NO: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Gesturing NO: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F645&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Gesturing NO: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F646",
                    Title: "Person Gesturing OK"
                }, {
                    Emoji: "&#x1F646&#x1F3FB",
                    Title: "Person Gesturing OK: Light Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x1F3FC",
                    Title: "Person Gesturing OK: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x1F3FD",
                    Title: "Person Gesturing OK: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x1F3FE",
                    Title: "Person Gesturing OK: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x1F3FF",
                    Title: "Person Gesturing OK: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x200D&#x2642&#xFE0F",
                    Title: "Man Gesturing OK"
                }, {
                    Emoji: "&#x1F646&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Gesturing OK: Light Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Gesturing OK: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Gesturing OK: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Gesturing OK: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Gesturing OK: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x200D&#x2640&#xFE0F",
                    Title: "Woman Gesturing OK"
                }, {
                    Emoji: "&#x1F646&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Gesturing OK: Light Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Gesturing OK: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Gesturing OK: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Gesturing OK: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F646&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Gesturing OK: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F481",
                    Title: "Person Tipping Hand"
                }, {
                    Emoji: "&#x1F481&#x1F3FB",
                    Title: "Person Tipping Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x1F3FC",
                    Title: "Person Tipping Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x1F3FD",
                    Title: "Person Tipping Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x1F3FE",
                    Title: "Person Tipping Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x1F3FF",
                    Title: "Person Tipping Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x200D&#x2642&#xFE0F",
                    Title: "Man Tipping Hand"
                }, {
                    Emoji: "&#x1F481&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Tipping Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Tipping Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Tipping Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Tipping Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Tipping Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x200D&#x2640&#xFE0F",
                    Title: "Woman Tipping Hand"
                }, {
                    Emoji: "&#x1F481&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Tipping Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Tipping Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Tipping Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Tipping Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F481&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Tipping Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64B",
                    Title: "Person Raising Hand"
                }, {
                    Emoji: "&#x1F64B&#x1F3FB",
                    Title: "Person Raising Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x1F3FC",
                    Title: "Person Raising Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x1F3FD",
                    Title: "Person Raising Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x1F3FE",
                    Title: "Person Raising Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x1F3FF",
                    Title: "Person Raising Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x200D&#x2642&#xFE0F",
                    Title: "Man Raising Hand"
                }, {
                    Emoji: "&#x1F64B&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Raising Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Raising Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Raising Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Raising Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Raising Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x200D&#x2640&#xFE0F",
                    Title: "Woman Raising Hand"
                }, {
                    Emoji: "&#x1F64B&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Raising Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Raising Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Raising Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Raising Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64B&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Raising Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F647",
                    Title: "Person Bowing"
                }, {
                    Emoji: "&#x1F647&#x1F3FB",
                    Title: "Person Bowing: Light Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x1F3FC",
                    Title: "Person Bowing: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x1F3FD",
                    Title: "Person Bowing: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x1F3FE",
                    Title: "Person Bowing: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x1F3FF",
                    Title: "Person Bowing: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x200D&#x2642&#xFE0F",
                    Title: "Man Bowing"
                }, {
                    Emoji: "&#x1F647&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Bowing: Light Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Bowing: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Bowing: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Bowing: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Bowing: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x200D&#x2640&#xFE0F",
                    Title: "Woman Bowing"
                }, {
                    Emoji: "&#x1F647&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Bowing: Light Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Bowing: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Bowing: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Bowing: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F647&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Bowing: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F926",
                    Title: "Person Facepalming"
                }, {
                    Emoji: "&#x1F926&#x1F3FB",
                    Title: "Person Facepalming: Light Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x1F3FC",
                    Title: "Person Facepalming: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x1F3FD",
                    Title: "Person Facepalming: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x1F3FE",
                    Title: "Person Facepalming: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x1F3FF",
                    Title: "Person Facepalming: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x200D&#x2642&#xFE0F",
                    Title: "Man Facepalming"
                }, {
                    Emoji: "&#x1F926&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Facepalming: Light Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Facepalming: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Facepalming: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Facepalming: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Facepalming: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x200D&#x2640&#xFE0F",
                    Title: "Woman Facepalming"
                }, {
                    Emoji: "&#x1F926&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Facepalming: Light Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Facepalming: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Facepalming: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Facepalming: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F926&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Facepalming: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F937",
                    Title: "Person Shrugging"
                }, {
                    Emoji: "&#x1F937&#x1F3FB",
                    Title: "Person Shrugging: Light Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x1F3FC",
                    Title: "Person Shrugging: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x1F3FD",
                    Title: "Person Shrugging: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x1F3FE",
                    Title: "Person Shrugging: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x1F3FF",
                    Title: "Person Shrugging: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x200D&#x2642&#xFE0F",
                    Title: "Man Shrugging"
                }, {
                    Emoji: "&#x1F937&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Shrugging: Light Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Shrugging: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Shrugging: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Shrugging: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Shrugging: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x200D&#x2640&#xFE0F",
                    Title: "Woman Shrugging"
                }, {
                    Emoji: "&#x1F937&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Shrugging: Light Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Shrugging: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Shrugging: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Shrugging: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F937&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Shrugging: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F486",
                    Title: "Person Getting Massage"
                }, {
                    Emoji: "&#x1F486&#x1F3FB",
                    Title: "Person Getting Massage: Light Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x1F3FC",
                    Title: "Person Getting Massage: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x1F3FD",
                    Title: "Person Getting Massage: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x1F3FE",
                    Title: "Person Getting Massage: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x1F3FF",
                    Title: "Person Getting Massage: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x200D&#x2642&#xFE0F",
                    Title: "Man Getting Massage"
                }, {
                    Emoji: "&#x1F486&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Getting Massage: Light Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Getting Massage: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Getting Massage: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Getting Massage: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Getting Massage: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x200D&#x2640&#xFE0F",
                    Title: "Woman Getting Massage"
                }, {
                    Emoji: "&#x1F486&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Getting Massage: Light Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Getting Massage: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Getting Massage: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Getting Massage: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F486&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Getting Massage: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F487",
                    Title: "Person Getting Haircut"
                }, {
                    Emoji: "&#x1F487&#x1F3FB",
                    Title: "Person Getting Haircut: Light Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x1F3FC",
                    Title: "Person Getting Haircut: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x1F3FD",
                    Title: "Person Getting Haircut: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x1F3FE",
                    Title: "Person Getting Haircut: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x1F3FF",
                    Title: "Person Getting Haircut: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x200D&#x2642&#xFE0F",
                    Title: "Man Getting Haircut"
                }, {
                    Emoji: "&#x1F487&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Getting Haircut: Light Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Getting Haircut: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Getting Haircut: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Getting Haircut: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Getting Haircut: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x200D&#x2640&#xFE0F",
                    Title: "Woman Getting Haircut"
                }, {
                    Emoji: "&#x1F487&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Getting Haircut: Light Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Getting Haircut: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Getting Haircut: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Getting Haircut: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F487&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Getting Haircut: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B6",
                    Title: "Person Walking"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FB",
                    Title: "Person Walking: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FC",
                    Title: "Person Walking: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FD",
                    Title: "Person Walking: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FE",
                    Title: "Person Walking: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FF",
                    Title: "Person Walking: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x200D&#x2642&#xFE0F",
                    Title: "Man Walking"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Walking: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Walking: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Walking: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Walking: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Walking: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x200D&#x2640&#xFE0F",
                    Title: "Woman Walking"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Walking: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Walking: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Walking: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Walking: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B6&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Walking: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C3",
                    Title: "Person Running"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FB",
                    Title: "Person Running: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FC",
                    Title: "Person Running: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FD",
                    Title: "Person Running: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FE",
                    Title: "Person Running: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FF",
                    Title: "Person Running: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x200D&#x2642&#xFE0F",
                    Title: "Man Running"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Running: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Running: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Running: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Running: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Running: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x200D&#x2640&#xFE0F",
                    Title: "Woman Running"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Running: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Running: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Running: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Running: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C3&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Running: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F483",
                    Title: "Woman Dancing"
                }, {
                    Emoji: "&#x1F483&#x1F3FB",
                    Title: "Woman Dancing: Light Skin Tone"
                }, {
                    Emoji: "&#x1F483&#x1F3FC",
                    Title: "Woman Dancing: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F483&#x1F3FD",
                    Title: "Woman Dancing: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F483&#x1F3FE",
                    Title: "Woman Dancing: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F483&#x1F3FF",
                    Title: "Woman Dancing: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F57A",
                    Title: "Man Dancing"
                }, {
                    Emoji: "&#x1F57A&#x1F3FB",
                    Title: "Man Dancing: Light Skin Tone"
                }, {
                    Emoji: "&#x1F57A&#x1F3FC",
                    Title: "Man Dancing: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F57A&#x1F3FD",
                    Title: "Man Dancing: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F57A&#x1F3FE",
                    Title: "Man Dancing: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F57A&#x1F3FF",
                    Title: "Man Dancing: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F46F",
                    Title: "People With Bunny Ears Partying"
                }, {
                    Emoji: "&#x1F46F&#x200D&#x2642&#xFE0F",
                    Title: "Men With Bunny Ears Partying"
                }, {
                    Emoji: "&#x1F46F&#x200D&#x2640&#xFE0F",
                    Title: "Women With Bunny Ears Partying"
                }, {
                    Emoji: "&#x1F574",
                    Title: "Man In Business Suit Levitating"
                }, {
                    Emoji: "&#x1F574&#x1F3FB",
                    Title: "Man In Business Suit Levitating: Light Skin Tone"
                }, {
                    Emoji: "&#x1F574&#x1F3FC",
                    Title: "Man In Business Suit Levitating: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F574&#x1F3FD",
                    Title: "Man In Business Suit Levitating: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F574&#x1F3FE",
                    Title: "Man In Business Suit Levitating: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F574&#x1F3FF",
                    Title: "Man In Business Suit Levitating: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F5E3",
                    Title: "Speaking Head"
                }, {
                    Emoji: "&#x1F464",
                    Title: "Bust In Silhouette"
                }, {
                    Emoji: "&#x1F465",
                    Title: "Busts In Silhouette"
                }, {
                    Emoji: "&#x1F93A",
                    Title: "Person Fencing"
                }, {
                    Emoji: "&#x1F3C7",
                    Title: "Horse Racing"
                }, {
                    Emoji: "&#x1F3C7&#x1F3FB",
                    Title: "Horse Racing: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C7&#x1F3FC",
                    Title: "Horse Racing: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C7&#x1F3FD",
                    Title: "Horse Racing: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3C7&#x1F3FE",
                    Title: "Horse Racing: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C7&#x1F3FF",
                    Title: "Horse Racing: Dark Skin Tone"
                }, {
                    Emoji: "&#x26F7",
                    Title: "Skier"
                }, {
                    Emoji: "&#x1F3C2",
                    Title: "Snowboarder"
                }, {
                    Emoji: "&#x1F3C2&#x1F3FB",
                    Title: "Snowboarder: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C2&#x1F3FC",
                    Title: "Snowboarder: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C2&#x1F3FD",
                    Title: "Snowboarder: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3C2&#x1F3FE",
                    Title: "Snowboarder: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C2&#x1F3FF",
                    Title: "Snowboarder: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CC",
                    Title: "Person Golfing"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FB",
                    Title: "Person Golfing: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FC",
                    Title: "Person Golfing: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FD",
                    Title: "Person Golfing: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FE",
                    Title: "Person Golfing: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FF",
                    Title: "Person Golfing: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#xFE0F&#x200D&#x2642&#xFE0F",
                    Title: "Man Golfing"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Golfing: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Golfing: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Golfing: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Golfing: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Golfing: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#xFE0F&#x200D&#x2640&#xFE0F",
                    Title: "Woman Golfing"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Golfing: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Golfing: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Golfing: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Golfing: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CC&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Golfing: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C4",
                    Title: "Person Surfing"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FB",
                    Title: "Person Surfing: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FC",
                    Title: "Person Surfing: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FD",
                    Title: "Person Surfing: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FE",
                    Title: "Person Surfing: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FF",
                    Title: "Person Surfing: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x200D&#x2642&#xFE0F",
                    Title: "Man Surfing"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Surfing: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Surfing: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Surfing: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Surfing: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Surfing: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x200D&#x2640&#xFE0F",
                    Title: "Woman Surfing"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Surfing: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Surfing: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Surfing: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Surfing: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3C4&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Surfing: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6A3",
                    Title: "Person Rowing Boat"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FB",
                    Title: "Person Rowing Boat: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FC",
                    Title: "Person Rowing Boat: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FD",
                    Title: "Person Rowing Boat: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FE",
                    Title: "Person Rowing Boat: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FF",
                    Title: "Person Rowing Boat: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x200D&#x2642&#xFE0F",
                    Title: "Man Rowing Boat"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Rowing Boat: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Rowing Boat: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Rowing Boat: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Rowing Boat: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Rowing Boat: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x200D&#x2640&#xFE0F",
                    Title: "Woman Rowing Boat"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Rowing Boat: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Rowing Boat: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Rowing Boat: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Rowing Boat: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6A3&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Rowing Boat: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CA",
                    Title: "Person Swimming"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FB",
                    Title: "Person Swimming: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FC",
                    Title: "Person Swimming: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FD",
                    Title: "Person Swimming: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FE",
                    Title: "Person Swimming: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FF",
                    Title: "Person Swimming: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x200D&#x2642&#xFE0F",
                    Title: "Man Swimming"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Swimming: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Swimming: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Swimming: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Swimming: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Swimming: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x200D&#x2640&#xFE0F",
                    Title: "Woman Swimming"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Swimming: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Swimming: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Swimming: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Swimming: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CA&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Swimming: Dark Skin Tone"
                }, {
                    Emoji: "&#x26F9",
                    Title: "Person Bouncing Ball"
                }, {
                    Emoji: "&#x26F9&#x1F3FB",
                    Title: "Person Bouncing Ball: Light Skin Tone"
                }, {
                    Emoji: "&#x26F9&#x1F3FC",
                    Title: "Person Bouncing Ball: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x26F9&#x1F3FD",
                    Title: "Person Bouncing Ball: Medium Skin Tone"
                }, {
                    Emoji: "&#x26F9&#x1F3FE",
                    Title: "Person Bouncing Ball: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x26F9&#x1F3FF",
                    Title: "Person Bouncing Ball: Dark Skin Tone"
                }, {
                    Emoji: "&#x26F9&#xFE0F&#x200D&#x2642&#xFE0F",
                    Title: "Man Bouncing Ball"
                }, {
                    Emoji: "&#x26F9&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Bouncing Ball: Light Skin Tone"
                }, {
                    Emoji: "&#x26F9&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Bouncing Ball: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x26F9&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Bouncing Ball: Medium Skin Tone"
                }, {
                    Emoji: "&#x26F9&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Bouncing Ball: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x26F9&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Bouncing Ball: Dark Skin Tone"
                }, {
                    Emoji: "&#x26F9&#xFE0F&#x200D&#x2640&#xFE0F",
                    Title: "Woman Bouncing Ball"
                }, {
                    Emoji: "&#x26F9&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Bouncing Ball: Light Skin Tone"
                }, {
                    Emoji: "&#x26F9&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Bouncing Ball: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x26F9&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Bouncing Ball: Medium Skin Tone"
                }, {
                    Emoji: "&#x26F9&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Bouncing Ball: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x26F9&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Bouncing Ball: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CB",
                    Title: "Person Lifting Weights"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FB",
                    Title: "Person Lifting Weights: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FC",
                    Title: "Person Lifting Weights: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FD",
                    Title: "Person Lifting Weights: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FE",
                    Title: "Person Lifting Weights: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FF",
                    Title: "Person Lifting Weights: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#xFE0F&#x200D&#x2642&#xFE0F",
                    Title: "Man Lifting Weights"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Lifting Weights: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Lifting Weights: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Lifting Weights: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Lifting Weights: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Lifting Weights: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#xFE0F&#x200D&#x2640&#xFE0F",
                    Title: "Woman Lifting Weights"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Lifting Weights: Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Lifting Weights: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Lifting Weights: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Lifting Weights: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CB&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Lifting Weights: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B4",
                    Title: "Person Biking"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FB",
                    Title: "Person Biking: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FC",
                    Title: "Person Biking: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FD",
                    Title: "Person Biking: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FE",
                    Title: "Person Biking: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FF",
                    Title: "Person Biking: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x200D&#x2642&#xFE0F",
                    Title: "Man Biking"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Biking: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Biking: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Biking: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Biking: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Biking: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x200D&#x2640&#xFE0F",
                    Title: "Woman Biking"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Biking: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Biking: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Biking: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Biking: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B4&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Biking: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B5",
                    Title: "Person Mountain Biking"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FB",
                    Title: "Person Mountain Biking: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FC",
                    Title: "Person Mountain Biking: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FD",
                    Title: "Person Mountain Biking: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FE",
                    Title: "Person Mountain Biking: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FF",
                    Title: "Person Mountain Biking: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x200D&#x2642&#xFE0F",
                    Title: "Man Mountain Biking"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Mountain Biking: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Mountain Biking: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Mountain Biking: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Mountain Biking: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Mountain Biking: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x200D&#x2640&#xFE0F",
                    Title: "Woman Mountain Biking"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Mountain Biking: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Mountain Biking: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Mountain Biking: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Mountain Biking: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6B5&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Mountain Biking: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3CE",
                    Title: "Racing Car"
                }, {
                    Emoji: "&#x1F3CD",
                    Title: "Motorcycle"
                }, {
                    Emoji: "&#x1F938",
                    Title: "Person Cartwheeling"
                }, {
                    Emoji: "&#x1F938&#x1F3FB",
                    Title: "Person Cartwheeling: Light Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x1F3FC",
                    Title: "Person Cartwheeling: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x1F3FD",
                    Title: "Person Cartwheeling: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x1F3FE",
                    Title: "Person Cartwheeling: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x1F3FF",
                    Title: "Person Cartwheeling: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x200D&#x2642&#xFE0F",
                    Title: "Man Cartwheeling"
                }, {
                    Emoji: "&#x1F938&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Cartwheeling: Light Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Cartwheeling: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Cartwheeling: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Cartwheeling: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Cartwheeling: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x200D&#x2640&#xFE0F",
                    Title: "Woman Cartwheeling"
                }, {
                    Emoji: "&#x1F938&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Cartwheeling: Light Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Cartwheeling: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Cartwheeling: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Cartwheeling: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F938&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Cartwheeling: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F93C",
                    Title: "People Wrestling"
                }, {
                    Emoji: "&#x1F93C&#x200D&#x2642&#xFE0F",
                    Title: "Men Wrestling"
                }, {
                    Emoji: "&#x1F93C&#x200D&#x2640&#xFE0F",
                    Title: "Women Wrestling"
                }, {
                    Emoji: "&#x1F93D",
                    Title: "Person Playing Water Polo"
                }, {
                    Emoji: "&#x1F93D&#x1F3FB",
                    Title: "Person Playing Water Polo: Light Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x1F3FC",
                    Title: "Person Playing Water Polo: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x1F3FD",
                    Title: "Person Playing Water Polo: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x1F3FE",
                    Title: "Person Playing Water Polo: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x1F3FF",
                    Title: "Person Playing Water Polo: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x200D&#x2642&#xFE0F",
                    Title: "Man Playing Water Polo"
                }, {
                    Emoji: "&#x1F93D&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Playing Water Polo: Light Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Playing Water Polo: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Playing Water Polo: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Playing Water Polo: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Playing Water Polo: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x200D&#x2640&#xFE0F",
                    Title: "Woman Playing Water Polo"
                }, {
                    Emoji: "&#x1F93D&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Playing Water Polo: Light Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Playing Water Polo: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Playing Water Polo: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Playing Water Polo: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F93D&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Playing Water Polo: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F93E",
                    Title: "Person Playing Handball"
                }, {
                    Emoji: "&#x1F93E&#x1F3FB",
                    Title: "Person Playing Handball: Light Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x1F3FC",
                    Title: "Person Playing Handball: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x1F3FD",
                    Title: "Person Playing Handball: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x1F3FE",
                    Title: "Person Playing Handball: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x1F3FF",
                    Title: "Person Playing Handball: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x200D&#x2642&#xFE0F",
                    Title: "Man Playing Handball"
                }, {
                    Emoji: "&#x1F93E&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Playing Handball: Light Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Playing Handball: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Playing Handball: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Playing Handball: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Playing Handball: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x200D&#x2640&#xFE0F",
                    Title: "Woman Playing Handball"
                }, {
                    Emoji: "&#x1F93E&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Playing Handball: Light Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Playing Handball: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Playing Handball: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Playing Handball: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F93E&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Playing Handball: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F939",
                    Title: "Person Juggling"
                }, {
                    Emoji: "&#x1F939&#x1F3FB",
                    Title: "Person Juggling: Light Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x1F3FC",
                    Title: "Person Juggling: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x1F3FD",
                    Title: "Person Juggling: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x1F3FE",
                    Title: "Person Juggling: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x1F3FF",
                    Title: "Person Juggling: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x200D&#x2642&#xFE0F",
                    Title: "Man Juggling"
                }, {
                    Emoji: "&#x1F939&#x1F3FB&#x200D&#x2642&#xFE0F",
                    Title: "Man Juggling: Light Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x1F3FC&#x200D&#x2642&#xFE0F",
                    Title: "Man Juggling: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x1F3FD&#x200D&#x2642&#xFE0F",
                    Title: "Man Juggling: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x1F3FE&#x200D&#x2642&#xFE0F",
                    Title: "Man Juggling: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x1F3FF&#x200D&#x2642&#xFE0F",
                    Title: "Man Juggling: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x200D&#x2640&#xFE0F",
                    Title: "Woman Juggling"
                }, {
                    Emoji: "&#x1F939&#x1F3FB&#x200D&#x2640&#xFE0F",
                    Title: "Woman Juggling: Light Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x1F3FC&#x200D&#x2640&#xFE0F",
                    Title: "Woman Juggling: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x1F3FD&#x200D&#x2640&#xFE0F",
                    Title: "Woman Juggling: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x1F3FE&#x200D&#x2640&#xFE0F",
                    Title: "Woman Juggling: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F939&#x1F3FF&#x200D&#x2640&#xFE0F",
                    Title: "Woman Juggling: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F46B",
                    Title: "Man And Woman Holding Hands"
                }, {
                    Emoji: "&#x1F46C",
                    Title: "Two Men Holding Hands"
                }, {
                    Emoji: "&#x1F46D",
                    Title: "Two Women Holding Hands"
                }, {
                    Emoji: "&#x1F48F",
                    Title: "Kiss"
                }, {
                    Emoji: "&#x1F469&#x200D&#x2764&#xFE0F&#x200D&#x1F48B&#x200D&#x1F468",
                    Title: "Kiss: Woman, Man"
                }, {
                    Emoji: "&#x1F468&#x200D&#x2764&#xFE0F&#x200D&#x1F48B&#x200D&#x1F468",
                    Title: "Kiss: Man, Man"
                }, {
                    Emoji: "&#x1F469&#x200D&#x2764&#xFE0F&#x200D&#x1F48B&#x200D&#x1F469",
                    Title: "Kiss: Woman, Woman"
                }, {
                    Emoji: "&#x1F491",
                    Title: "Couple With Heart"
                }, {
                    Emoji: "&#x1F469&#x200D&#x2764&#xFE0F&#x200D&#x1F468",
                    Title: "Couple With Heart: Woman, Man"
                }, {
                    Emoji: "&#x1F468&#x200D&#x2764&#xFE0F&#x200D&#x1F468",
                    Title: "Couple With Heart: Man, Man"
                }, {
                    Emoji: "&#x1F469&#x200D&#x2764&#xFE0F&#x200D&#x1F469",
                    Title: "Couple With Heart: Woman, Woman"
                }, {
                    Emoji: "&#x1F46A",
                    Title: "Family"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F469&#x200D&#x1F466",
                    Title: "Family: Man, Woman, Boy"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F469&#x200D&#x1F467",
                    Title: "Family: Man, Woman, Girl"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F469&#x200D&#x1F467&#x200D&#x1F466",
                    Title: "Family: Man, Woman, Girl, Boy"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F469&#x200D&#x1F466&#x200D&#x1F466",
                    Title: "Family: Man, Woman, Boy, Boy"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F469&#x200D&#x1F467&#x200D&#x1F467",
                    Title: "Family: Man, Woman, Girl, Girl"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F468&#x200D&#x1F466",
                    Title: "Family: Man, Man, Boy"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F468&#x200D&#x1F467",
                    Title: "Family: Man, Man, Girl"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F468&#x200D&#x1F467&#x200D&#x1F466",
                    Title: "Family: Man, Man, Girl, Boy"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F468&#x200D&#x1F466&#x200D&#x1F466",
                    Title: "Family: Man, Man, Boy, Boy"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F468&#x200D&#x1F467&#x200D&#x1F467",
                    Title: "Family: Man, Man, Girl, Girl"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F469&#x200D&#x1F466",
                    Title: "Family: Woman, Woman, Boy"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F469&#x200D&#x1F467",
                    Title: "Family: Woman, Woman, Girl"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F469&#x200D&#x1F467&#x200D&#x1F466",
                    Title: "Family: Woman, Woman, Girl, Boy"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F469&#x200D&#x1F466&#x200D&#x1F466",
                    Title: "Family: Woman, Woman, Boy, Boy"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F469&#x200D&#x1F467&#x200D&#x1F467",
                    Title: "Family: Woman, Woman, Girl, Girl"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F466",
                    Title: "Family: Man, Boy"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F466&#x200D&#x1F466",
                    Title: "Family: Man, Boy, Boy"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F467",
                    Title: "Family: Man, Girl"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F467&#x200D&#x1F466",
                    Title: "Family: Man, Girl, Boy"
                }, {
                    Emoji: "&#x1F468&#x200D&#x1F467&#x200D&#x1F467",
                    Title: "Family: Man, Girl, Girl"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F466",
                    Title: "Family: Woman, Boy"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F466&#x200D&#x1F466",
                    Title: "Family: Woman, Boy, Boy"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F467",
                    Title: "Family: Woman, Girl"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F467&#x200D&#x1F466",
                    Title: "Family: Woman, Girl, Boy"
                }, {
                    Emoji: "&#x1F469&#x200D&#x1F467&#x200D&#x1F467",
                    Title: "Family: Woman, Girl, Girl"
                }, {
                    Emoji: "&#x1F3FB",
                    Title: "Light Skin Tone"
                }, {
                    Emoji: "&#x1F3FC",
                    Title: "Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F3FD",
                    Title: "Medium Skin Tone"
                }, {
                    Emoji: "&#x1F3FE",
                    Title: "Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F3FF",
                    Title: "Dark Skin Tone"
                }, {
                    Emoji: "&#x1F4AA",
                    Title: "Flexed Biceps"
                }, {
                    Emoji: "&#x1F4AA&#x1F3FB",
                    Title: "Flexed Biceps: Light Skin Tone"
                }, {
                    Emoji: "&#x1F4AA&#x1F3FC",
                    Title: "Flexed Biceps: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F4AA&#x1F3FD",
                    Title: "Flexed Biceps: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F4AA&#x1F3FE",
                    Title: "Flexed Biceps: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F4AA&#x1F3FF",
                    Title: "Flexed Biceps: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F933",
                    Title: "Selfie"
                }, {
                    Emoji: "&#x1F933&#x1F3FB",
                    Title: "Selfie: Light Skin Tone"
                }, {
                    Emoji: "&#x1F933&#x1F3FC",
                    Title: "Selfie: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F933&#x1F3FD",
                    Title: "Selfie: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F933&#x1F3FE",
                    Title: "Selfie: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F933&#x1F3FF",
                    Title: "Selfie: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F448",
                    Title: "Backhand Index Pointing Left"
                }, {
                    Emoji: "&#x1F448&#x1F3FB",
                    Title: "Backhand Index Pointing Left: Light Skin Tone"
                }, {
                    Emoji: "&#x1F448&#x1F3FC",
                    Title: "Backhand Index Pointing Left: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F448&#x1F3FD",
                    Title: "Backhand Index Pointing Left: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F448&#x1F3FE",
                    Title: "Backhand Index Pointing Left: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F448&#x1F3FF",
                    Title: "Backhand Index Pointing Left: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F449",
                    Title: "Backhand Index Pointing Right"
                }, {
                    Emoji: "&#x1F449&#x1F3FB",
                    Title: "Backhand Index Pointing Right: Light Skin Tone"
                }, {
                    Emoji: "&#x1F449&#x1F3FC",
                    Title: "Backhand Index Pointing Right: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F449&#x1F3FD",
                    Title: "Backhand Index Pointing Right: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F449&#x1F3FE",
                    Title: "Backhand Index Pointing Right: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F449&#x1F3FF",
                    Title: "Backhand Index Pointing Right: Dark Skin Tone"
                }, {
                    Emoji: "&#x261D",
                    Title: "Index Pointing Up"
                }, {
                    Emoji: "&#x261D&#x1F3FB",
                    Title: "Index Pointing Up: Light Skin Tone"
                }, {
                    Emoji: "&#x261D&#x1F3FC",
                    Title: "Index Pointing Up: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x261D&#x1F3FD",
                    Title: "Index Pointing Up: Medium Skin Tone"
                }, {
                    Emoji: "&#x261D&#x1F3FE",
                    Title: "Index Pointing Up: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x261D&#x1F3FF",
                    Title: "Index Pointing Up: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F446",
                    Title: "Backhand Index Pointing Up"
                }, {
                    Emoji: "&#x1F446&#x1F3FB",
                    Title: "Backhand Index Pointing Up: Light Skin Tone"
                }, {
                    Emoji: "&#x1F446&#x1F3FC",
                    Title: "Backhand Index Pointing Up: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F446&#x1F3FD",
                    Title: "Backhand Index Pointing Up: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F446&#x1F3FE",
                    Title: "Backhand Index Pointing Up: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F446&#x1F3FF",
                    Title: "Backhand Index Pointing Up: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F595",
                    Title: "Middle Finger"
                }, {
                    Emoji: "&#x1F595&#x1F3FB",
                    Title: "Middle Finger: Light Skin Tone"
                }, {
                    Emoji: "&#x1F595&#x1F3FC",
                    Title: "Middle Finger: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F595&#x1F3FD",
                    Title: "Middle Finger: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F595&#x1F3FE",
                    Title: "Middle Finger: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F595&#x1F3FF",
                    Title: "Middle Finger: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F447",
                    Title: "Backhand Index Pointing Down"
                }, {
                    Emoji: "&#x1F447&#x1F3FB",
                    Title: "Backhand Index Pointing Down: Light Skin Tone"
                }, {
                    Emoji: "&#x1F447&#x1F3FC",
                    Title: "Backhand Index Pointing Down: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F447&#x1F3FD",
                    Title: "Backhand Index Pointing Down: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F447&#x1F3FE",
                    Title: "Backhand Index Pointing Down: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F447&#x1F3FF",
                    Title: "Backhand Index Pointing Down: Dark Skin Tone"
                }, {
                    Emoji: "&#x270C",
                    Title: "Victory Hand"
                }, {
                    Emoji: "&#x270C&#x1F3FB",
                    Title: "Victory Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x270C&#x1F3FC",
                    Title: "Victory Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x270C&#x1F3FD",
                    Title: "Victory Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x270C&#x1F3FE",
                    Title: "Victory Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x270C&#x1F3FF",
                    Title: "Victory Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F91E",
                    Title: "Crossed Fingers"
                }, {
                    Emoji: "&#x1F91E&#x1F3FB",
                    Title: "Crossed Fingers: Light Skin Tone"
                }, {
                    Emoji: "&#x1F91E&#x1F3FC",
                    Title: "Crossed Fingers: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F91E&#x1F3FD",
                    Title: "Crossed Fingers: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F91E&#x1F3FE",
                    Title: "Crossed Fingers: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F91E&#x1F3FF",
                    Title: "Crossed Fingers: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F596",
                    Title: "Vulcan Salute"
                }, {
                    Emoji: "&#x1F596&#x1F3FB",
                    Title: "Vulcan Salute: Light Skin Tone"
                }, {
                    Emoji: "&#x1F596&#x1F3FC",
                    Title: "Vulcan Salute: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F596&#x1F3FD",
                    Title: "Vulcan Salute: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F596&#x1F3FE",
                    Title: "Vulcan Salute: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F596&#x1F3FF",
                    Title: "Vulcan Salute: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F918",
                    Title: "Sign Of The Horns"
                }, {
                    Emoji: "&#x1F918&#x1F3FB",
                    Title: "Sign Of The Horns: Light Skin Tone"
                }, {
                    Emoji: "&#x1F918&#x1F3FC",
                    Title: "Sign Of The Horns: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F918&#x1F3FD",
                    Title: "Sign Of The Horns: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F918&#x1F3FE",
                    Title: "Sign Of The Horns: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F918&#x1F3FF",
                    Title: "Sign Of The Horns: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F919",
                    Title: "Call Me Hand"
                }, {
                    Emoji: "&#x1F919&#x1F3FB",
                    Title: "Call Me Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x1F919&#x1F3FC",
                    Title: "Call Me Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F919&#x1F3FD",
                    Title: "Call Me Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F919&#x1F3FE",
                    Title: "Call Me Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F919&#x1F3FF",
                    Title: "Call Me Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F590",
                    Title: "Raised Hand With Fingers Splayed"
                }, {
                    Emoji: "&#x1F590&#x1F3FB",
                    Title: "Raised Hand With Fingers Splayed: Light Skin Tone"
                }, {
                    Emoji: "&#x1F590&#x1F3FC",
                    Title: "Raised Hand With Fingers Splayed: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F590&#x1F3FD",
                    Title: "Raised Hand With Fingers Splayed: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F590&#x1F3FE",
                    Title: "Raised Hand With Fingers Splayed: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F590&#x1F3FF",
                    Title: "Raised Hand With Fingers Splayed: Dark Skin Tone"
                }, {
                    Emoji: "&#x270B",
                    Title: "Raised Hand"
                }, {
                    Emoji: "&#x270B&#x1F3FB",
                    Title: "Raised Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x270B&#x1F3FC",
                    Title: "Raised Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x270B&#x1F3FD",
                    Title: "Raised Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x270B&#x1F3FE",
                    Title: "Raised Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x270B&#x1F3FF",
                    Title: "Raised Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F44C",
                    Title: "OK Hand"
                }, {
                    Emoji: "&#x1F44C&#x1F3FB",
                    Title: "OK Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x1F44C&#x1F3FC",
                    Title: "OK Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F44C&#x1F3FD",
                    Title: "OK Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F44C&#x1F3FE",
                    Title: "OK Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F44C&#x1F3FF",
                    Title: "OK Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F44D",
                    Title: "Thumbs Up"
                }, {
                    Emoji: "&#x1F44D&#x1F3FB",
                    Title: "Thumbs Up: Light Skin Tone"
                }, {
                    Emoji: "&#x1F44D&#x1F3FC",
                    Title: "Thumbs Up: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F44D&#x1F3FD",
                    Title: "Thumbs Up: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F44D&#x1F3FE",
                    Title: "Thumbs Up: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F44D&#x1F3FF",
                    Title: "Thumbs Up: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F44E",
                    Title: "Thumbs Down"
                }, {
                    Emoji: "&#x1F44E&#x1F3FB",
                    Title: "Thumbs Down: Light Skin Tone"
                }, {
                    Emoji: "&#x1F44E&#x1F3FC",
                    Title: "Thumbs Down: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F44E&#x1F3FD",
                    Title: "Thumbs Down: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F44E&#x1F3FE",
                    Title: "Thumbs Down: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F44E&#x1F3FF",
                    Title: "Thumbs Down: Dark Skin Tone"
                }, {
                    Emoji: "&#x270A",
                    Title: "Raised Fist"
                }, {
                    Emoji: "&#x270A&#x1F3FB",
                    Title: "Raised Fist: Light Skin Tone"
                }, {
                    Emoji: "&#x270A&#x1F3FC",
                    Title: "Raised Fist: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x270A&#x1F3FD",
                    Title: "Raised Fist: Medium Skin Tone"
                }, {
                    Emoji: "&#x270A&#x1F3FE",
                    Title: "Raised Fist: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x270A&#x1F3FF",
                    Title: "Raised Fist: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F44A",
                    Title: "Oncoming Fist"
                }, {
                    Emoji: "&#x1F44A&#x1F3FB",
                    Title: "Oncoming Fist: Light Skin Tone"
                }, {
                    Emoji: "&#x1F44A&#x1F3FC",
                    Title: "Oncoming Fist: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F44A&#x1F3FD",
                    Title: "Oncoming Fist: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F44A&#x1F3FE",
                    Title: "Oncoming Fist: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F44A&#x1F3FF",
                    Title: "Oncoming Fist: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F91B",
                    Title: "Left-Facing Fist"
                }, {
                    Emoji: "&#x1F91B&#x1F3FB",
                    Title: "Left-Facing Fist: Light Skin Tone"
                }, {
                    Emoji: "&#x1F91B&#x1F3FC",
                    Title: "Left-Facing Fist: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F91B&#x1F3FD",
                    Title: "Left-Facing Fist: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F91B&#x1F3FE",
                    Title: "Left-Facing Fist: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F91B&#x1F3FF",
                    Title: "Left-Facing Fist: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F91C",
                    Title: "Right-Facing Fist"
                }, {
                    Emoji: "&#x1F91C&#x1F3FB",
                    Title: "Right-Facing Fist: Light Skin Tone"
                }, {
                    Emoji: "&#x1F91C&#x1F3FC",
                    Title: "Right-Facing Fist: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F91C&#x1F3FD",
                    Title: "Right-Facing Fist: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F91C&#x1F3FE",
                    Title: "Right-Facing Fist: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F91C&#x1F3FF",
                    Title: "Right-Facing Fist: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F91A",
                    Title: "Raised Back Of Hand"
                }, {
                    Emoji: "&#x1F91A&#x1F3FB",
                    Title: "Raised Back Of Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x1F91A&#x1F3FC",
                    Title: "Raised Back Of Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F91A&#x1F3FD",
                    Title: "Raised Back Of Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F91A&#x1F3FE",
                    Title: "Raised Back Of Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F91A&#x1F3FF",
                    Title: "Raised Back Of Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F44B",
                    Title: "Waving Hand"
                }, {
                    Emoji: "&#x1F44B&#x1F3FB",
                    Title: "Waving Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x1F44B&#x1F3FC",
                    Title: "Waving Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F44B&#x1F3FD",
                    Title: "Waving Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F44B&#x1F3FE",
                    Title: "Waving Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F44B&#x1F3FF",
                    Title: "Waving Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F44F",
                    Title: "Clapping Hands"
                }, {
                    Emoji: "&#x1F44F&#x1F3FB",
                    Title: "Clapping Hands: Light Skin Tone"
                }, {
                    Emoji: "&#x1F44F&#x1F3FC",
                    Title: "Clapping Hands: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F44F&#x1F3FD",
                    Title: "Clapping Hands: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F44F&#x1F3FE",
                    Title: "Clapping Hands: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F44F&#x1F3FF",
                    Title: "Clapping Hands: Dark Skin Tone"
                }, {
                    Emoji: "&#x270D",
                    Title: "Writing Hand"
                }, {
                    Emoji: "&#x270D&#x1F3FB",
                    Title: "Writing Hand: Light Skin Tone"
                }, {
                    Emoji: "&#x270D&#x1F3FC",
                    Title: "Writing Hand: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x270D&#x1F3FD",
                    Title: "Writing Hand: Medium Skin Tone"
                }, {
                    Emoji: "&#x270D&#x1F3FE",
                    Title: "Writing Hand: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x270D&#x1F3FF",
                    Title: "Writing Hand: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F450",
                    Title: "Open Hands"
                }, {
                    Emoji: "&#x1F450&#x1F3FB",
                    Title: "Open Hands: Light Skin Tone"
                }, {
                    Emoji: "&#x1F450&#x1F3FC",
                    Title: "Open Hands: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F450&#x1F3FD",
                    Title: "Open Hands: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F450&#x1F3FE",
                    Title: "Open Hands: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F450&#x1F3FF",
                    Title: "Open Hands: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64C",
                    Title: "Raising Hands"
                }, {
                    Emoji: "&#x1F64C&#x1F3FB",
                    Title: "Raising Hands: Light Skin Tone"
                }, {
                    Emoji: "&#x1F64C&#x1F3FC",
                    Title: "Raising Hands: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F64C&#x1F3FD",
                    Title: "Raising Hands: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F64C&#x1F3FE",
                    Title: "Raising Hands: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64C&#x1F3FF",
                    Title: "Raising Hands: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64F",
                    Title: "Folded Hands"
                }, {
                    Emoji: "&#x1F64F&#x1F3FB",
                    Title: "Folded Hands: Light Skin Tone"
                }, {
                    Emoji: "&#x1F64F&#x1F3FC",
                    Title: "Folded Hands: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F64F&#x1F3FD",
                    Title: "Folded Hands: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F64F&#x1F3FE",
                    Title: "Folded Hands: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F64F&#x1F3FF",
                    Title: "Folded Hands: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F91D",
                    Title: "Handshake"
                }, {
                    Emoji: "&#x1F485",
                    Title: "Nail Polish"
                }, {
                    Emoji: "&#x1F485&#x1F3FB",
                    Title: "Nail Polish: Light Skin Tone"
                }, {
                    Emoji: "&#x1F485&#x1F3FC",
                    Title: "Nail Polish: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F485&#x1F3FD",
                    Title: "Nail Polish: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F485&#x1F3FE",
                    Title: "Nail Polish: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F485&#x1F3FF",
                    Title: "Nail Polish: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F442",
                    Title: "Ear"
                }, {
                    Emoji: "&#x1F442&#x1F3FB",
                    Title: "Ear: Light Skin Tone"
                }, {
                    Emoji: "&#x1F442&#x1F3FC",
                    Title: "Ear: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F442&#x1F3FD",
                    Title: "Ear: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F442&#x1F3FE",
                    Title: "Ear: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F442&#x1F3FF",
                    Title: "Ear: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F443",
                    Title: "Nose"
                }, {
                    Emoji: "&#x1F443&#x1F3FB",
                    Title: "Nose: Light Skin Tone"
                }, {
                    Emoji: "&#x1F443&#x1F3FC",
                    Title: "Nose: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F443&#x1F3FD",
                    Title: "Nose: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F443&#x1F3FE",
                    Title: "Nose: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F443&#x1F3FF",
                    Title: "Nose: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F463",
                    Title: "Footprints"
                }, {
                    Emoji: "&#x1F440",
                    Title: "Eyes"
                }, {
                    Emoji: "&#x1F441",
                    Title: "Eye"
                }, {
                    Emoji: "&#x1F441&#xFE0F&#x200D&#x1F5E8&#xFE0F",
                    Title: "Eye In Speech Bubble"
                }, {
                    Emoji: "&#x1F445",
                    Title: "Tongue"
                }, {
                    Emoji: "&#x1F444",
                    Title: "Mouth"
                }, {
                    Emoji: "&#x1F48B",
                    Title: "Kiss Mark"
                }, {
                    Emoji: "&#x1F498",
                    Title: "Heart With Arrow"
                }, {
                    Emoji: "&#x2764",
                    Title: "Red Heart"
                }, {
                    Emoji: "&#x1F493",
                    Title: "Beating Heart"
                }, {
                    Emoji: "&#x1F494",
                    Title: "Broken Heart"
                }, {
                    Emoji: "&#x1F495",
                    Title: "Two Hearts"
                }, {
                    Emoji: "&#x1F496",
                    Title: "Sparkling Heart"
                }, {
                    Emoji: "&#x1F497",
                    Title: "Growing Heart"
                }, {
                    Emoji: "&#x1F499",
                    Title: "Blue Heart"
                }, {
                    Emoji: "&#x1F49A",
                    Title: "Green Heart"
                }, {
                    Emoji: "&#x1F49B",
                    Title: "Yellow Heart"
                }, {
                    Emoji: "&#x1F49C",
                    Title: "Purple Heart"
                }, {
                    Emoji: "&#x1F5A4",
                    Title: "Black Heart"
                }, {
                    Emoji: "&#x1F49D",
                    Title: "Heart With Ribbon"
                }, {
                    Emoji: "&#x1F49E",
                    Title: "Revolving Hearts"
                }, {
                    Emoji: "&#x1F49F",
                    Title: "Heart Decoration"
                }, {
                    Emoji: "&#x2763",
                    Title: "Heavy Heart Exclamation"
                }, {
                    Emoji: "&#x1F48C",
                    Title: "Love Letter"
                }, {
                    Emoji: "&#x1F4A4",
                    Title: "Zzz"
                }, {
                    Emoji: "&#x1F4A2",
                    Title: "Anger Symbol"
                }, {
                    Emoji: "&#x1F4A3",
                    Title: "Bomb"
                }, {
                    Emoji: "&#x1F4A5",
                    Title: "Collision"
                }, {
                    Emoji: "&#x1F4A6",
                    Title: "Sweat Droplets"
                }, {
                    Emoji: "&#x1F4A8",
                    Title: "Dashing Away"
                }, {
                    Emoji: "&#x1F4AB",
                    Title: "Dizzy"
                }, {
                    Emoji: "&#x1F4AC",
                    Title: "Speech Balloon"
                }, {
                    Emoji: "&#x1F5E8",
                    Title: "Left Speech Bubble"
                }, {
                    Emoji: "&#x1F5EF",
                    Title: "Right Anger Bubble"
                }, {
                    Emoji: "&#x1F4AD",
                    Title: "Thought Balloon"
                }, {
                    Emoji: "&#x1F573",
                    Title: "Hole"
                }, {
                    Emoji: "&#x1F453",
                    Title: "Glasses"
                }, {
                    Emoji: "&#x1F576",
                    Title: "Sunglasses"
                }, {
                    Emoji: "&#x1F454",
                    Title: "Necktie"
                }, {
                    Emoji: "&#x1F455",
                    Title: "T-Shirt"
                }, {
                    Emoji: "&#x1F456",
                    Title: "Jeans"
                }, {
                    Emoji: "&#x1F457",
                    Title: "Dress"
                }, {
                    Emoji: "&#x1F458",
                    Title: "Kimono"
                }, {
                    Emoji: "&#x1F459",
                    Title: "Bikini"
                }, {
                    Emoji: "&#x1F45A",
                    Title: "Woman’s Clothes"
                }, {
                    Emoji: "&#x1F45B",
                    Title: "Purse"
                }, {
                    Emoji: "&#x1F45C",
                    Title: "Handbag"
                }, {
                    Emoji: "&#x1F45D",
                    Title: "Clutch Bag"
                }, {
                    Emoji: "&#x1F6CD",
                    Title: "Shopping Bags"
                }, {
                    Emoji: "&#x1F392",
                    Title: "School Backpack"
                }, {
                    Emoji: "&#x1F45E",
                    Title: "Man’s Shoe"
                }, {
                    Emoji: "&#x1F45F",
                    Title: "Running Shoe"
                }, {
                    Emoji: "&#x1F460",
                    Title: "High-Heeled Shoe"
                }, {
                    Emoji: "&#x1F461",
                    Title: "Woman’s Sandal"
                }, {
                    Emoji: "&#x1F462",
                    Title: "Woman’s Boot"
                }, {
                    Emoji: "&#x1F451",
                    Title: "Crown"
                }, {
                    Emoji: "&#x1F452",
                    Title: "Woman’s Hat"
                }, {
                    Emoji: "&#x1F3A9",
                    Title: "Top Hat"
                }, {
                    Emoji: "&#x1F393",
                    Title: "Graduation Cap"
                }, {
                    Emoji: "&#x26D1",
                    Title: "Rescue Worker’s Helmet"
                }, {
                    Emoji: "&#x1F4FF",
                    Title: "Prayer Beads"
                }, {
                    Emoji: "&#x1F484",
                    Title: "Lipstick"
                }, {
                    Emoji: "&#x1F48D",
                    Title: "Ring"
                }, {
                    Emoji: "&#x1F48E",
                    Title: "Gem Stone"
                }, {
                    Emoji: "&#x1F435",
                    Title: "Monkey Face"
                }, {
                    Emoji: "&#x1F412",
                    Title: "Monkey"
                }, {
                    Emoji: "&#x1F98D",
                    Title: "Gorilla"
                }, {
                    Emoji: "&#x1F436",
                    Title: "Dog Face"
                }, {
                    Emoji: "&#x1F415",
                    Title: "Dog"
                }, {
                    Emoji: "&#x1F429",
                    Title: "Poodle"
                }, {
                    Emoji: "&#x1F43A",
                    Title: "Wolf Face"
                }, {
                    Emoji: "&#x1F98A",
                    Title: "Fox Face"
                }, {
                    Emoji: "&#x1F431",
                    Title: "Cat Face"
                }, {
                    Emoji: "&#x1F408",
                    Title: "Cat"
                }, {
                    Emoji: "&#x1F981",
                    Title: "Lion Face"
                }, {
                    Emoji: "&#x1F42F",
                    Title: "Tiger Face"
                }, {
                    Emoji: "&#x1F405",
                    Title: "Tiger"
                }, {
                    Emoji: "&#x1F406",
                    Title: "Leopard"
                }, {
                    Emoji: "&#x1F434",
                    Title: "Horse Face"
                }, {
                    Emoji: "&#x1F40E",
                    Title: "Horse"
                }, {
                    Emoji: "&#x1F98C",
                    Title: "Deer"
                }, {
                    Emoji: "&#x1F984",
                    Title: "Unicorn Face"
                }, {
                    Emoji: "&#x1F42E",
                    Title: "Cow Face"
                }, {
                    Emoji: "&#x1F402",
                    Title: "Ox"
                }, {
                    Emoji: "&#x1F403",
                    Title: "Water Buffalo"
                }, {
                    Emoji: "&#x1F404",
                    Title: "Cow"
                }, {
                    Emoji: "&#x1F437",
                    Title: "Pig Face"
                }, {
                    Emoji: "&#x1F416",
                    Title: "Pig"
                }, {
                    Emoji: "&#x1F417",
                    Title: "Boar"
                }, {
                    Emoji: "&#x1F43D",
                    Title: "Pig Nose"
                }, {
                    Emoji: "&#x1F40F",
                    Title: "Ram"
                }, {
                    Emoji: "&#x1F411",
                    Title: "Sheep"
                }, {
                    Emoji: "&#x1F410",
                    Title: "Goat"
                }, {
                    Emoji: "&#x1F42A",
                    Title: "Camel"
                }, {
                    Emoji: "&#x1F42B",
                    Title: "Two-Hump Camel"
                }, {
                    Emoji: "&#x1F418",
                    Title: "Elephant"
                }, {
                    Emoji: "&#x1F98F",
                    Title: "Rhinoceros"
                }, {
                    Emoji: "&#x1F42D",
                    Title: "Mouse Face"
                }, {
                    Emoji: "&#x1F401",
                    Title: "Mouse"
                }, {
                    Emoji: "&#x1F400",
                    Title: "Rat"
                }, {
                    Emoji: "&#x1F439",
                    Title: "Hamster Face"
                }, {
                    Emoji: "&#x1F430",
                    Title: "Rabbit Face"
                }, {
                    Emoji: "&#x1F407",
                    Title: "Rabbit"
                }, {
                    Emoji: "&#x1F43F",
                    Title: "Chipmunk"
                }, {
                    Emoji: "&#x1F987",
                    Title: "Bat"
                }, {
                    Emoji: "&#x1F43B",
                    Title: "Bear Face"
                }, {
                    Emoji: "&#x1F428",
                    Title: "Koala"
                }, {
                    Emoji: "&#x1F43C",
                    Title: "Panda Face"
                }, {
                    Emoji: "&#x1F43E",
                    Title: "Paw Prints"
                }, {
                    Emoji: "&#x1F983",
                    Title: "Turkey"
                }, {
                    Emoji: "&#x1F414",
                    Title: "Chicken"
                }, {
                    Emoji: "&#x1F413",
                    Title: "Rooster"
                }, {
                    Emoji: "&#x1F423",
                    Title: "Hatching Chick"
                }, {
                    Emoji: "&#x1F424",
                    Title: "Baby Chick"
                }, {
                    Emoji: "&#x1F425",
                    Title: "Front-Facing Baby Chick"
                }, {
                    Emoji: "&#x1F426",
                    Title: "Bird"
                }, {
                    Emoji: "&#x1F427",
                    Title: "Penguin"
                }, {
                    Emoji: "&#x1F54A",
                    Title: "Dove"
                }, {
                    Emoji: "&#x1F985",
                    Title: "Eagle"
                }, {
                    Emoji: "&#x1F986",
                    Title: "Duck"
                }, {
                    Emoji: "&#x1F989",
                    Title: "Owl"
                }, {
                    Emoji: "&#x1F438",
                    Title: "Frog Face"
                }, {
                    Emoji: "&#x1F40A",
                    Title: "Crocodile"
                }, {
                    Emoji: "&#x1F422",
                    Title: "Turtle"
                }, {
                    Emoji: "&#x1F98E",
                    Title: "Lizard"
                }, {
                    Emoji: "&#x1F40D",
                    Title: "Snake"
                }, {
                    Emoji: "&#x1F432",
                    Title: "Dragon Face"
                }, {
                    Emoji: "&#x1F409",
                    Title: "Dragon"
                }, {
                    Emoji: "&#x1F433",
                    Title: "Spouting Whale"
                }, {
                    Emoji: "&#x1F40B",
                    Title: "Whale"
                }, {
                    Emoji: "&#x1F42C",
                    Title: "Dolphin"
                }, {
                    Emoji: "&#x1F41F",
                    Title: "Fish"
                }, {
                    Emoji: "&#x1F420",
                    Title: "Tropical Fish"
                }, {
                    Emoji: "&#x1F421",
                    Title: "Blowfish"
                }, {
                    Emoji: "&#x1F988",
                    Title: "Shark"
                }, {
                    Emoji: "&#x1F419",
                    Title: "Octopus"
                }, {
                    Emoji: "&#x1F41A",
                    Title: "Spiral Shell"
                }, {
                    Emoji: "&#x1F980",
                    Title: "Crab"
                }, {
                    Emoji: "&#x1F990",
                    Title: "Shrimp"
                }, {
                    Emoji: "&#x1F991",
                    Title: "Squid"
                }, {
                    Emoji: "&#x1F98B",
                    Title: "Butterfly"
                }, {
                    Emoji: "&#x1F40C",
                    Title: "Snail"
                }, {
                    Emoji: "&#x1F41B",
                    Title: "Bug"
                }, {
                    Emoji: "&#x1F41C",
                    Title: "Ant"
                }, {
                    Emoji: "&#x1F41D",
                    Title: "Honeybee"
                }, {
                    Emoji: "&#x1F41E",
                    Title: "Lady Beetle"
                }, {
                    Emoji: "&#x1F577",
                    Title: "Spider"
                }, {
                    Emoji: "&#x1F578",
                    Title: "Spider Web"
                }, {
                    Emoji: "&#x1F982",
                    Title: "Scorpion"
                }, {
                    Emoji: "&#x1F490",
                    Title: "Bouquet"
                }, {
                    Emoji: "&#x1F338",
                    Title: "Cherry Blossom"
                }, {
                    Emoji: "&#x1F4AE",
                    Title: "White Flower"
                }, {
                    Emoji: "&#x1F3F5",
                    Title: "Rosette"
                }, {
                    Emoji: "&#x1F339",
                    Title: "Rose"
                }, {
                    Emoji: "&#x1F940",
                    Title: "Wilted Flower"
                }, {
                    Emoji: "&#x1F33A",
                    Title: "Hibiscus"
                }, {
                    Emoji: "&#x1F33B",
                    Title: "Sunflower"
                }, {
                    Emoji: "&#x1F33C",
                    Title: "Blossom"
                }, {
                    Emoji: "&#x1F337",
                    Title: "Tulip"
                }, {
                    Emoji: "&#x1F331",
                    Title: "Seedling"
                }, {
                    Emoji: "&#x1F332",
                    Title: "Evergreen Tree"
                }, {
                    Emoji: "&#x1F333",
                    Title: "Deciduous Tree"
                }, {
                    Emoji: "&#x1F334",
                    Title: "Palm Tree"
                }, {
                    Emoji: "&#x1F335",
                    Title: "Cactus"
                }, {
                    Emoji: "&#x1F33E",
                    Title: "Sheaf Of Rice"
                }, {
                    Emoji: "&#x1F33F",
                    Title: "Herb"
                }, {
                    Emoji: "&#x2618",
                    Title: "Shamrock"
                }, {
                    Emoji: "&#x1F340",
                    Title: "Four Leaf Clover"
                }, {
                    Emoji: "&#x1F341",
                    Title: "Maple Leaf"
                }, {
                    Emoji: "&#x1F342",
                    Title: "Fallen Leaf"
                }, {
                    Emoji: "&#x1F343",
                    Title: "Leaf Fluttering In Wind"
                }, {
                    Emoji: "&#x1F347",
                    Title: "Grapes"
                }, {
                    Emoji: "&#x1F348",
                    Title: "Melon"
                }, {
                    Emoji: "&#x1F349",
                    Title: "Watermelon"
                }, {
                    Emoji: "&#x1F34A",
                    Title: "Tangerine"
                }, {
                    Emoji: "&#x1F34B",
                    Title: "Lemon"
                }, {
                    Emoji: "&#x1F34C",
                    Title: "Banana"
                }, {
                    Emoji: "&#x1F34D",
                    Title: "Pineapple"
                }, {
                    Emoji: "&#x1F34E",
                    Title: "Red Apple"
                }, {
                    Emoji: "&#x1F34F",
                    Title: "Green Apple"
                }, {
                    Emoji: "&#x1F350",
                    Title: "Pear"
                }, {
                    Emoji: "&#x1F351",
                    Title: "Peach"
                }, {
                    Emoji: "&#x1F352",
                    Title: "Cherries"
                }, {
                    Emoji: "&#x1F353",
                    Title: "Strawberry"
                }, {
                    Emoji: "&#x1F95D",
                    Title: "Kiwi Fruit"
                }, {
                    Emoji: "&#x1F345",
                    Title: "Tomato"
                }, {
                    Emoji: "&#x1F951",
                    Title: "Avocado"
                }, {
                    Emoji: "&#x1F346",
                    Title: "Eggplant"
                }, {
                    Emoji: "&#x1F954",
                    Title: "Potato"
                }, {
                    Emoji: "&#x1F955",
                    Title: "Carrot"
                }, {
                    Emoji: "&#x1F33D",
                    Title: "Ear Of Corn"
                }, {
                    Emoji: "&#x1F336",
                    Title: "Hot Pepper"
                }, {
                    Emoji: "&#x1F952",
                    Title: "Cucumber"
                }, {
                    Emoji: "&#x1F344",
                    Title: "Mushroom"
                }, {
                    Emoji: "&#x1F95C",
                    Title: "Peanuts"
                }, {
                    Emoji: "&#x1F330",
                    Title: "Chestnut"
                }, {
                    Emoji: "&#x1F35E",
                    Title: "Bread"
                }, {
                    Emoji: "&#x1F950",
                    Title: "Croissant"
                }, {
                    Emoji: "&#x1F956",
                    Title: "Baguette Bread"
                }, {
                    Emoji: "&#x1F95E",
                    Title: "Pancakes"
                }, {
                    Emoji: "&#x1F9C0",
                    Title: "Cheese Wedge"
                }, {
                    Emoji: "&#x1F356",
                    Title: "Meat On Bone"
                }, {
                    Emoji: "&#x1F357",
                    Title: "Poultry Leg"
                }, {
                    Emoji: "&#x1F953",
                    Title: "Bacon"
                }, {
                    Emoji: "&#x1F354",
                    Title: "Hamburger"
                }, {
                    Emoji: "&#x1F35F",
                    Title: "French Fries"
                }, {
                    Emoji: "&#x1F355",
                    Title: "Pizza"
                }, {
                    Emoji: "&#x1F32D",
                    Title: "Hot Dog"
                }, {
                    Emoji: "&#x1F32E",
                    Title: "Taco"
                }, {
                    Emoji: "&#x1F32F",
                    Title: "Burrito"
                }, {
                    Emoji: "&#x1F959",
                    Title: "Stuffed Flatbread"
                }, {
                    Emoji: "&#x1F95A",
                    Title: "Egg"
                }, {
                    Emoji: "&#x1F373",
                    Title: "Cooking"
                }, {
                    Emoji: "&#x1F958",
                    Title: "Shallow Pan Of Food"
                }, {
                    Emoji: "&#x1F372",
                    Title: "Pot Of Food"
                }, {
                    Emoji: "&#x1F957",
                    Title: "Green Salad"
                }, {
                    Emoji: "&#x1F37F",
                    Title: "Popcorn"
                }, {
                    Emoji: "&#x1F371",
                    Title: "Bento Box"
                }, {
                    Emoji: "&#x1F358",
                    Title: "Rice Cracker"
                }, {
                    Emoji: "&#x1F359",
                    Title: "Rice Ball"
                }, {
                    Emoji: "&#x1F35A",
                    Title: "Cooked Rice"
                }, {
                    Emoji: "&#x1F35B",
                    Title: "Curry Rice"
                }, {
                    Emoji: "&#x1F35C",
                    Title: "Steaming Bowl"
                }, {
                    Emoji: "&#x1F35D",
                    Title: "Spaghetti"
                }, {
                    Emoji: "&#x1F360",
                    Title: "Roasted Sweet Potato"
                }, {
                    Emoji: "&#x1F362",
                    Title: "Oden"
                }, {
                    Emoji: "&#x1F363",
                    Title: "Sushi"
                }, {
                    Emoji: "&#x1F364",
                    Title: "Fried Shrimp"
                }, {
                    Emoji: "&#x1F365",
                    Title: "Fish Cake With Swirl"
                }, {
                    Emoji: "&#x1F361",
                    Title: "Dango"
                }, {
                    Emoji: "&#x1F366",
                    Title: "Soft Ice Cream"
                }, {
                    Emoji: "&#x1F367",
                    Title: "Shaved Ice"
                }, {
                    Emoji: "&#x1F368",
                    Title: "Ice Cream"
                }, {
                    Emoji: "&#x1F369",
                    Title: "Doughnut"
                }, {
                    Emoji: "&#x1F36A",
                    Title: "Cookie"
                }, {
                    Emoji: "&#x1F382",
                    Title: "Birthday Cake"
                }, {
                    Emoji: "&#x1F370",
                    Title: "Shortcake"
                }, {
                    Emoji: "&#x1F36B",
                    Title: "Chocolate Bar"
                }, {
                    Emoji: "&#x1F36C",
                    Title: "Candy"
                }, {
                    Emoji: "&#x1F36D",
                    Title: "Lollipop"
                }, {
                    Emoji: "&#x1F36E",
                    Title: "Custard"
                }, {
                    Emoji: "&#x1F36F",
                    Title: "Honey Pot"
                }, {
                    Emoji: "&#x1F37C",
                    Title: "Baby Bottle"
                }, {
                    Emoji: "&#x1F95B",
                    Title: "Glass Of Milk"
                }, {
                    Emoji: "&#x2615",
                    Title: "Hot Beverage"
                }, {
                    Emoji: "&#x1F375",
                    Title: "Teacup Without Handle"
                }, {
                    Emoji: "&#x1F376",
                    Title: "Sake"
                }, {
                    Emoji: "&#x1F37E",
                    Title: "Bottle With Popping Cork"
                }, {
                    Emoji: "&#x1F377",
                    Title: "Wine Glass"
                }, {
                    Emoji: "&#x1F378",
                    Title: "Cocktail Glass"
                }, {
                    Emoji: "&#x1F379",
                    Title: "Tropical Drink"
                }, {
                    Emoji: "&#x1F37A",
                    Title: "Beer Mug"
                }, {
                    Emoji: "&#x1F37B",
                    Title: "Clinking Beer Mugs"
                }, {
                    Emoji: "&#x1F942",
                    Title: "Clinking Glasses"
                }, {
                    Emoji: "&#x1F943",
                    Title: "Tumbler Glass"
                }, {
                    Emoji: "&#x1F37D",
                    Title: "Fork And Knife With Plate"
                }, {
                    Emoji: "&#x1F374",
                    Title: "Fork And Knife"
                }, {
                    Emoji: "&#x1F944",
                    Title: "Spoon"
                }, {
                    Emoji: "&#x1F52A",
                    Title: "Kitchen Knife"
                }, {
                    Emoji: "&#x1F3FA",
                    Title: "Amphora"
                }, {
                    Emoji: "&#x1F30D",
                    Title: "Globe Showing Europe-Africa"
                }, {
                    Emoji: "&#x1F30E",
                    Title: "Globe Showing Americas"
                }, {
                    Emoji: "&#x1F30F",
                    Title: "Globe Showing Asia-Australia"
                }, {
                    Emoji: "&#x1F310",
                    Title: "Globe With Meridians"
                }, {
                    Emoji: "&#x1F5FA",
                    Title: "World Map"
                }, {
                    Emoji: "&#x1F5FE",
                    Title: "Map Of Japan"
                }, {
                    Emoji: "&#x1F3D4",
                    Title: "Snow-Capped Mountain"
                }, {
                    Emoji: "&#x26F0",
                    Title: "Mountain"
                }, {
                    Emoji: "&#x1F30B",
                    Title: "Volcano"
                }, {
                    Emoji: "&#x1F5FB",
                    Title: "Mount Fuji"
                }, {
                    Emoji: "&#x1F3D5",
                    Title: "Camping"
                }, {
                    Emoji: "&#x1F3D6",
                    Title: "Beach With Umbrella"
                }, {
                    Emoji: "&#x1F3DC",
                    Title: "Desert"
                }, {
                    Emoji: "&#x1F3DD",
                    Title: "Desert Island"
                }, {
                    Emoji: "&#x1F3DE",
                    Title: "National Park"
                }, {
                    Emoji: "&#x1F3DF",
                    Title: "Stadium"
                }, {
                    Emoji: "&#x1F3DB",
                    Title: "Classical Building"
                }, {
                    Emoji: "&#x1F3D7",
                    Title: "Building Construction"
                }, {
                    Emoji: "&#x1F3D8",
                    Title: "House"
                }, {
                    Emoji: "&#x1F3D9",
                    Title: "Cityscape"
                }, {
                    Emoji: "&#x1F3DA",
                    Title: "Derelict House"
                }, {
                    Emoji: "&#x1F3E0",
                    Title: "House"
                }, {
                    Emoji: "&#x1F3E1",
                    Title: "House With Garden"
                }, {
                    Emoji: "&#x1F3E2",
                    Title: "Office Building"
                }, {
                    Emoji: "&#x1F3E3",
                    Title: "Japanese Post Office"
                }, {
                    Emoji: "&#x1F3E4",
                    Title: "Post Office"
                }, {
                    Emoji: "&#x1F3E5",
                    Title: "Hospital"
                }, {
                    Emoji: "&#x1F3E6",
                    Title: "Bank"
                }, {
                    Emoji: "&#x1F3E8",
                    Title: "Hotel"
                }, {
                    Emoji: "&#x1F3E9",
                    Title: "Love Hotel"
                }, {
                    Emoji: "&#x1F3EA",
                    Title: "Convenience Store"
                }, {
                    Emoji: "&#x1F3EB",
                    Title: "School"
                }, {
                    Emoji: "&#x1F3EC",
                    Title: "Department Store"
                }, {
                    Emoji: "&#x1F3ED",
                    Title: "Factory"
                }, {
                    Emoji: "&#x1F3EF",
                    Title: "Japanese Castle"
                }, {
                    Emoji: "&#x1F3F0",
                    Title: "Castle"
                }, {
                    Emoji: "&#x1F492",
                    Title: "Wedding"
                }, {
                    Emoji: "&#x1F5FC",
                    Title: "Tokyo Tower"
                }, {
                    Emoji: "&#x1F5FD",
                    Title: "Statue Of Liberty"
                }, {
                    Emoji: "&#x26EA",
                    Title: "Church"
                }, {
                    Emoji: "&#x1F54C",
                    Title: "Mosque"
                }, {
                    Emoji: "&#x1F54D",
                    Title: "Synagogue"
                }, {
                    Emoji: "&#x26E9",
                    Title: "Shinto Shrine"
                }, {
                    Emoji: "&#x1F54B",
                    Title: "Kaaba"
                }, {
                    Emoji: "&#x26F2",
                    Title: "Fountain"
                }, {
                    Emoji: "&#x26FA",
                    Title: "Tent"
                }, {
                    Emoji: "&#x1F301",
                    Title: "Foggy"
                }, {
                    Emoji: "&#x1F303",
                    Title: "Night With Stars"
                }, {
                    Emoji: "&#x1F304",
                    Title: "Sunrise Over Mountains"
                }, {
                    Emoji: "&#x1F305",
                    Title: "Sunrise"
                }, {
                    Emoji: "&#x1F306",
                    Title: "Cityscape At Dusk"
                }, {
                    Emoji: "&#x1F307",
                    Title: "Sunset"
                }, {
                    Emoji: "&#x1F309",
                    Title: "Bridge At Night"
                }, {
                    Emoji: "&#x2668",
                    Title: "Hot Springs"
                }, {
                    Emoji: "&#x1F30C",
                    Title: "Milky Way"
                }, {
                    Emoji: "&#x1F3A0",
                    Title: "Carousel Horse"
                }, {
                    Emoji: "&#x1F3A1",
                    Title: "Ferris Wheel"
                }, {
                    Emoji: "&#x1F3A2",
                    Title: "Roller Coaster"
                }, {
                    Emoji: "&#x1F488",
                    Title: "Barber Pole"
                }, {
                    Emoji: "&#x1F3AA",
                    Title: "Circus Tent"
                }, {
                    Emoji: "&#x1F3AD",
                    Title: "Performing Arts"
                }, {
                    Emoji: "&#x1F5BC",
                    Title: "Framed Picture"
                }, {
                    Emoji: "&#x1F3A8",
                    Title: "Artist Palette"
                }, {
                    Emoji: "&#x1F3B0",
                    Title: "Slot Machine"
                }, {
                    Emoji: "&#x1F682",
                    Title: "Locomotive"
                }, {
                    Emoji: "&#x1F683",
                    Title: "Railway Car"
                }, {
                    Emoji: "&#x1F684",
                    Title: "High-Speed Train"
                }, {
                    Emoji: "&#x1F685",
                    Title: "High-Speed Train With Bullet Nose"
                }, {
                    Emoji: "&#x1F686",
                    Title: "Train"
                }, {
                    Emoji: "&#x1F687",
                    Title: "Metro"
                }, {
                    Emoji: "&#x1F688",
                    Title: "Light Rail"
                }, {
                    Emoji: "&#x1F689",
                    Title: "Station"
                }, {
                    Emoji: "&#x1F68A",
                    Title: "Tram"
                }, {
                    Emoji: "&#x1F69D",
                    Title: "Monorail"
                }, {
                    Emoji: "&#x1F69E",
                    Title: "Mountain Railway"
                }, {
                    Emoji: "&#x1F68B",
                    Title: "Tram Car"
                }, {
                    Emoji: "&#x1F68C",
                    Title: "Bus"
                }, {
                    Emoji: "&#x1F68D",
                    Title: "Oncoming Bus"
                }, {
                    Emoji: "&#x1F68E",
                    Title: "Trolleybus"
                }, {
                    Emoji: "&#x1F690",
                    Title: "Minibus"
                }, {
                    Emoji: "&#x1F691",
                    Title: "Ambulance"
                }, {
                    Emoji: "&#x1F692",
                    Title: "Fire Engine"
                }, {
                    Emoji: "&#x1F693",
                    Title: "Police Car"
                }, {
                    Emoji: "&#x1F694",
                    Title: "Oncoming Police Car"
                }, {
                    Emoji: "&#x1F695",
                    Title: "Taxi"
                }, {
                    Emoji: "&#x1F696",
                    Title: "Oncoming Taxi"
                }, {
                    Emoji: "&#x1F697",
                    Title: "Automobile"
                }, {
                    Emoji: "&#x1F698",
                    Title: "Oncoming Automobile"
                }, {
                    Emoji: "&#x1F699",
                    Title: "Sport Utility Vehicle"
                }, {
                    Emoji: "&#x1F69A",
                    Title: "Delivery Truck"
                }, {
                    Emoji: "&#x1F69B",
                    Title: "Articulated Lorry"
                }, {
                    Emoji: "&#x1F69C",
                    Title: "Tractor"
                }, {
                    Emoji: "&#x1F6B2",
                    Title: "Bicycle"
                }, {
                    Emoji: "&#x1F6F4",
                    Title: "Kick Scooter"
                }, {
                    Emoji: "&#x1F6F5",
                    Title: "Motor Scooter"
                }, {
                    Emoji: "&#x1F68F",
                    Title: "Bus Stop"
                }, {
                    Emoji: "&#x1F6E3",
                    Title: "Motorway"
                }, {
                    Emoji: "&#x1F6E4",
                    Title: "Railway Track"
                }, {
                    Emoji: "&#x26FD",
                    Title: "Fuel Pump"
                }, {
                    Emoji: "&#x1F6A8",
                    Title: "Police Car Light"
                }, {
                    Emoji: "&#x1F6A5",
                    Title: "Horizontal Traffic Light"
                }, {
                    Emoji: "&#x1F6A6",
                    Title: "Vertical Traffic Light"
                }, {
                    Emoji: "&#x1F6A7",
                    Title: "Construction"
                }, {
                    Emoji: "&#x1F6D1",
                    Title: "Stop Sign"
                }, {
                    Emoji: "&#x2693",
                    Title: "Anchor"
                }, {
                    Emoji: "&#x26F5",
                    Title: "Sailboat"
                }, {
                    Emoji: "&#x1F6F6",
                    Title: "Canoe"
                }, {
                    Emoji: "&#x1F6A4",
                    Title: "Speedboat"
                }, {
                    Emoji: "&#x1F6F3",
                    Title: "Passenger Ship"
                }, {
                    Emoji: "&#x26F4",
                    Title: "Ferry"
                }, {
                    Emoji: "&#x1F6E5",
                    Title: "Motor Boat"
                }, {
                    Emoji: "&#x1F6A2",
                    Title: "Ship"
                }, {
                    Emoji: "&#x2708",
                    Title: "Airplane"
                }, {
                    Emoji: "&#x1F6E9",
                    Title: "Small Airplane"
                }, {
                    Emoji: "&#x1F6EB",
                    Title: "Airplane Departure"
                }, {
                    Emoji: "&#x1F6EC",
                    Title: "Airplane Arrival"
                }, {
                    Emoji: "&#x1F4BA",
                    Title: "Seat"
                }, {
                    Emoji: "&#x1F681",
                    Title: "Helicopter"
                }, {
                    Emoji: "&#x1F69F",
                    Title: "Suspension Railway"
                }, {
                    Emoji: "&#x1F6A0",
                    Title: "Mountain Cableway"
                }, {
                    Emoji: "&#x1F6A1",
                    Title: "Aerial Tramway"
                }, {
                    Emoji: "&#x1F680",
                    Title: "Rocket"
                }, {
                    Emoji: "&#x1F6F0",
                    Title: "Satellite"
                }, {
                    Emoji: "&#x1F6CE",
                    Title: "Bellhop Bell"
                }, {
                    Emoji: "&#x1F6AA",
                    Title: "Door"
                }, {
                    Emoji: "&#x1F6CC",
                    Title: "Person In Bed"
                }, {
                    Emoji: "&#x1F6CC&#x1F3FB",
                    Title: "Person In Bed: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6CC&#x1F3FC",
                    Title: "Person In Bed: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6CC&#x1F3FD",
                    Title: "Person In Bed: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6CC&#x1F3FE",
                    Title: "Person In Bed: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6CC&#x1F3FF",
                    Title: "Person In Bed: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6CF",
                    Title: "Bed"
                }, {
                    Emoji: "&#x1F6CB",
                    Title: "Couch And Lamp"
                }, {
                    Emoji: "&#x1F6BD",
                    Title: "Toilet"
                }, {
                    Emoji: "&#x1F6BF",
                    Title: "Shower"
                }, {
                    Emoji: "&#x1F6C0",
                    Title: "Person Taking Bath"
                }, {
                    Emoji: "&#x1F6C0&#x1F3FB",
                    Title: "Person Taking Bath: Light Skin Tone"
                }, {
                    Emoji: "&#x1F6C0&#x1F3FC",
                    Title: "Person Taking Bath: Medium-Light Skin Tone"
                }, {
                    Emoji: "&#x1F6C0&#x1F3FD",
                    Title: "Person Taking Bath: Medium Skin Tone"
                }, {
                    Emoji: "&#x1F6C0&#x1F3FE",
                    Title: "Person Taking Bath: Medium-Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6C0&#x1F3FF",
                    Title: "Person Taking Bath: Dark Skin Tone"
                }, {
                    Emoji: "&#x1F6C1",
                    Title: "Bathtub"
                }, {
                    Emoji: "&#x231B",
                    Title: "Hourglass"
                }, {
                    Emoji: "&#x23F3",
                    Title: "Hourglass With Flowing Sand"
                }, {
                    Emoji: "&#x231A",
                    Title: "Watch"
                }, {
                    Emoji: "&#x23F0",
                    Title: "Alarm Clock"
                }, {
                    Emoji: "&#x23F1",
                    Title: "Stopwatch"
                }, {
                    Emoji: "&#x23F2",
                    Title: "Timer Clock"
                }, {
                    Emoji: "&#x1F570",
                    Title: "Mantelpiece Clock"
                }, {
                    Emoji: "&#x1F55B",
                    Title: "Twelve O’clock"
                }, {
                    Emoji: "&#x1F567",
                    Title: "Twelve-Thirty"
                }, {
                    Emoji: "&#x1F550",
                    Title: "One O’clock"
                }, {
                    Emoji: "&#x1F55C",
                    Title: "One-Thirty"
                }, {
                    Emoji: "&#x1F551",
                    Title: "Two O’clock"
                }, {
                    Emoji: "&#x1F55D",
                    Title: "Two-Thirty"
                }, {
                    Emoji: "&#x1F552",
                    Title: "Three O’clock"
                }, {
                    Emoji: "&#x1F55E",
                    Title: "Three-Thirty"
                }, {
                    Emoji: "&#x1F553",
                    Title: "Four O’clock"
                }, {
                    Emoji: "&#x1F55F",
                    Title: "Four-Thirty"
                }, {
                    Emoji: "&#x1F554",
                    Title: "Five O’clock"
                }, {
                    Emoji: "&#x1F560",
                    Title: "Five-Thirty"
                }, {
                    Emoji: "&#x1F555",
                    Title: "Six O’clock"
                }, {
                    Emoji: "&#x1F561",
                    Title: "Six-Thirty"
                }, {
                    Emoji: "&#x1F556",
                    Title: "Seven O’clock"
                }, {
                    Emoji: "&#x1F562",
                    Title: "Seven-Thirty"
                }, {
                    Emoji: "&#x1F557",
                    Title: "Eight O’clock"
                }, {
                    Emoji: "&#x1F563",
                    Title: "Eight-Thirty"
                }, {
                    Emoji: "&#x1F558",
                    Title: "Nine O’clock"
                }, {
                    Emoji: "&#x1F564",
                    Title: "Nine-Thirty"
                }, {
                    Emoji: "&#x1F559",
                    Title: "Ten O’clock"
                }, {
                    Emoji: "&#x1F565",
                    Title: "Ten-Thirty"
                }, {
                    Emoji: "&#x1F55A",
                    Title: "Eleven O’clock"
                }, {
                    Emoji: "&#x1F566",
                    Title: "Eleven-Thirty"
                }, {
                    Emoji: "&#x1F311",
                    Title: "New Moon"
                }, {
                    Emoji: "&#x1F312",
                    Title: "Waxing Crescent Moon"
                }, {
                    Emoji: "&#x1F313",
                    Title: "First Quarter Moon"
                }, {
                    Emoji: "&#x1F314",
                    Title: "Waxing Gibbous Moon"
                }, {
                    Emoji: "&#x1F315",
                    Title: "Full Moon"
                }, {
                    Emoji: "&#x1F316",
                    Title: "Waning Gibbous Moon"
                }, {
                    Emoji: "&#x1F317",
                    Title: "Last Quarter Moon"
                }, {
                    Emoji: "&#x1F318",
                    Title: "Waning Crescent Moon"
                }, {
                    Emoji: "&#x1F319",
                    Title: "Crescent Moon"
                }, {
                    Emoji: "&#x1F31A",
                    Title: "New Moon Face"
                }, {
                    Emoji: "&#x1F31B",
                    Title: "First Quarter Moon With Face"
                }, {
                    Emoji: "&#x1F31C",
                    Title: "Last Quarter Moon With Face"
                }, {
                    Emoji: "&#x1F321",
                    Title: "Thermometer"
                }, {
                    Emoji: "&#x2600",
                    Title: "Sun"
                }, {
                    Emoji: "&#x1F31D",
                    Title: "Full Moon With Face"
                }, {
                    Emoji: "&#x1F31E",
                    Title: "Sun With Face"
                }, {
                    Emoji: "&#x2B50",
                    Title: "White Medium Star"
                }, {
                    Emoji: "&#x1F31F",
                    Title: "Glowing Star"
                }, {
                    Emoji: "&#x1F320",
                    Title: "Shooting Star"
                }, {
                    Emoji: "&#x2601",
                    Title: "Cloud"
                }, {
                    Emoji: "&#x26C5",
                    Title: "Sun Behind Cloud"
                }, {
                    Emoji: "&#x26C8",
                    Title: "Cloud With Lightning And Rain"
                }, {
                    Emoji: "&#x1F324",
                    Title: "Sun Behind Small Cloud"
                }, {
                    Emoji: "&#x1F325",
                    Title: "Sun Behind Large Cloud"
                }, {
                    Emoji: "&#x1F326",
                    Title: "Sun Behind Rain Cloud"
                }, {
                    Emoji: "&#x1F327",
                    Title: "Cloud With Rain"
                }, {
                    Emoji: "&#x1F328",
                    Title: "Cloud With Snow"
                }, {
                    Emoji: "&#x1F329",
                    Title: "Cloud With Lightning"
                }, {
                    Emoji: "&#x1F32A",
                    Title: "Tornado"
                }, {
                    Emoji: "&#x1F32B",
                    Title: "Fog"
                }, {
                    Emoji: "&#x1F32C",
                    Title: "Wind Face"
                }, {
                    Emoji: "&#x1F300",
                    Title: "Cyclone"
                }, {
                    Emoji: "&#x1F308",
                    Title: "Rainbow"
                }, {
                    Emoji: "&#x1F302",
                    Title: "Closed Umbrella"
                }, {
                    Emoji: "&#x2602",
                    Title: "Umbrella"
                }, {
                    Emoji: "&#x2614",
                    Title: "Umbrella With Rain Drops"
                }, {
                    Emoji: "&#x26F1",
                    Title: "Umbrella On Ground"
                }, {
                    Emoji: "&#x26A1",
                    Title: "High Voltage"
                }, {
                    Emoji: "&#x2744",
                    Title: "Snowflake"
                }, {
                    Emoji: "&#x2603",
                    Title: "Snowman"
                }, {
                    Emoji: "&#x26C4",
                    Title: "Snowman Without Snow"
                }, {
                    Emoji: "&#x2604",
                    Title: "Comet"
                }, {
                    Emoji: "&#x1F525",
                    Title: "Fire"
                }, {
                    Emoji: "&#x1F4A7",
                    Title: "Droplet"
                }, {
                    Emoji: "&#x1F30A",
                    Title: "Water Wave"
                }, {
                    Emoji: "&#x1F383",
                    Title: "Jack-O-Lantern"
                }, {
                    Emoji: "&#x1F384",
                    Title: "Christmas Tree"
                }, {
                    Emoji: "&#x1F386",
                    Title: "Fireworks"
                }, {
                    Emoji: "&#x1F387",
                    Title: "Sparkler"
                }, {
                    Emoji: "&#x2728",
                    Title: "Sparkles"
                }, {
                    Emoji: "&#x1F388",
                    Title: "Balloon"
                }, {
                    Emoji: "&#x1F389",
                    Title: "Party Popper"
                }, {
                    Emoji: "&#x1F38A",
                    Title: "Confetti Ball"
                }, {
                    Emoji: "&#x1F38B",
                    Title: "Tanabata Tree"
                }, {
                    Emoji: "&#x1F38D",
                    Title: "Pine Decoration"
                }, {
                    Emoji: "&#x1F38E",
                    Title: "Japanese Dolls"
                }, {
                    Emoji: "&#x1F38F",
                    Title: "Carp Streamer"
                }, {
                    Emoji: "&#x1F390",
                    Title: "Wind Chime"
                }, {
                    Emoji: "&#x1F391",
                    Title: "Moon Viewing Ceremony"
                }, {
                    Emoji: "&#x1F380",
                    Title: "Ribbon"
                }, {
                    Emoji: "&#x1F381",
                    Title: "Wrapped Gift"
                }, {
                    Emoji: "&#x1F397",
                    Title: "Reminder Ribbon"
                }, {
                    Emoji: "&#x1F39F",
                    Title: "Admission Tickets"
                }, {
                    Emoji: "&#x1F3AB",
                    Title: "Ticket"
                }, {
                    Emoji: "&#x1F396",
                    Title: "Military Medal"
                }, {
                    Emoji: "&#x1F3C6",
                    Title: "Trophy"
                }, {
                    Emoji: "&#x1F3C5",
                    Title: "Sports Medal"
                }, {
                    Emoji: "&#x1F947",
                    Title: "1st Place Medal"
                }, {
                    Emoji: "&#x1F948",
                    Title: "2nd Place Medal"
                }, {
                    Emoji: "&#x1F949",
                    Title: "3rd Place Medal"
                }, {
                    Emoji: "&#x26BD",
                    Title: "Soccer Ball"
                }, {
                    Emoji: "&#x26BE",
                    Title: "Baseball"
                }, {
                    Emoji: "&#x1F3C0",
                    Title: "Basketball"
                }, {
                    Emoji: "&#x1F3D0",
                    Title: "Volleyball"
                }, {
                    Emoji: "&#x1F3C8",
                    Title: "American Football"
                }, {
                    Emoji: "&#x1F3C9",
                    Title: "Rugby Football"
                }, {
                    Emoji: "&#x1F3BE",
                    Title: "Tennis"
                }, {
                    Emoji: "&#x1F3B1",
                    Title: "Pool 8 Ball"
                }, {
                    Emoji: "&#x1F3B3",
                    Title: "Bowling"
                }, {
                    Emoji: "&#x1F3CF",
                    Title: "Cricket"
                }, {
                    Emoji: "&#x1F3D1",
                    Title: "Field Hockey"
                }, {
                    Emoji: "&#x1F3D2",
                    Title: "Ice Hockey"
                }, {
                    Emoji: "&#x1F3D3",
                    Title: "Ping Pong"
                }, {
                    Emoji: "&#x1F3F8",
                    Title: "Badminton"
                }, {
                    Emoji: "&#x1F94A",
                    Title: "Boxing Glove"
                }, {
                    Emoji: "&#x1F94B",
                    Title: "Martial Arts Uniform"
                }, {
                    Emoji: "&#x1F945",
                    Title: "Goal Net"
                }, {
                    Emoji: "&#x1F3AF",
                    Title: "Direct Hit"
                }, {
                    Emoji: "&#x26F3",
                    Title: "Flag In Hole"
                }, {
                    Emoji: "&#x26F8",
                    Title: "Ice Skate"
                }, {
                    Emoji: "&#x1F3A3",
                    Title: "Fishing Pole"
                }, {
                    Emoji: "&#x1F3BD",
                    Title: "Running Shirt"
                }, {
                    Emoji: "&#x1F3BF",
                    Title: "Skis"
                }, {
                    Emoji: "&#x1F3AE",
                    Title: "Video Game"
                }, {
                    Emoji: "&#x1F579",
                    Title: "Joystick"
                }, {
                    Emoji: "&#x1F3B2",
                    Title: "Game Die"
                }, {
                    Emoji: "&#x2660",
                    Title: "Spade Suit"
                }, {
                    Emoji: "&#x2665",
                    Title: "Heart Suit"
                }, {
                    Emoji: "&#x2666",
                    Title: "Diamond Suit"
                }, {
                    Emoji: "&#x2663",
                    Title: "Club Suit"
                }, {
                    Emoji: "&#x1F0CF",
                    Title: "Joker"
                }, {
                    Emoji: "&#x1F004",
                    Title: "Mahjong Red Dragon"
                }, {
                    Emoji: "&#x1F3B4",
                    Title: "Flower Playing Cards"
                }, {
                    Emoji: "&#x1F507",
                    Title: "Muted Speaker"
                }, {
                    Emoji: "&#x1F508",
                    Title: "Speaker Low Volume"
                }, {
                    Emoji: "&#x1F509",
                    Title: "Speaker Medium Volume"
                }, {
                    Emoji: "&#x1F50A",
                    Title: "Speaker High Volume"
                }, {
                    Emoji: "&#x1F4E2",
                    Title: "Loudspeaker"
                }, {
                    Emoji: "&#x1F4E3",
                    Title: "Megaphone"
                }, {
                    Emoji: "&#x1F4EF",
                    Title: "Postal Horn"
                }, {
                    Emoji: "&#x1F514",
                    Title: "Bell"
                }, {
                    Emoji: "&#x1F515",
                    Title: "Bell With Slash"
                }, {
                    Emoji: "&#x1F3BC",
                    Title: "Musical Score"
                }, {
                    Emoji: "&#x1F3B5",
                    Title: "Musical Note"
                }, {
                    Emoji: "&#x1F3B6",
                    Title: "Musical Notes"
                }, {
                    Emoji: "&#x1F399",
                    Title: "Studio Microphone"
                }, {
                    Emoji: "&#x1F39A",
                    Title: "Level Slider"
                }, {
                    Emoji: "&#x1F39B",
                    Title: "Control Knobs"
                }, {
                    Emoji: "&#x1F3A4",
                    Title: "Microphone"
                }, {
                    Emoji: "&#x1F3A7",
                    Title: "Headphone"
                }, {
                    Emoji: "&#x1F4FB",
                    Title: "Radio"
                }, {
                    Emoji: "&#x1F3B7",
                    Title: "Saxophone"
                }, {
                    Emoji: "&#x1F3B8",
                    Title: "Guitar"
                }, {
                    Emoji: "&#x1F3B9",
                    Title: "Musical Keyboard"
                }, {
                    Emoji: "&#x1F3BA",
                    Title: "Trumpet"
                }, {
                    Emoji: "&#x1F3BB",
                    Title: "Violin"
                }, {
                    Emoji: "&#x1F941",
                    Title: "Drum"
                }, {
                    Emoji: "&#x1F4F1",
                    Title: "Mobile Phone"
                }, {
                    Emoji: "&#x1F4F2",
                    Title: "Mobile Phone With Arrow"
                }, {
                    Emoji: "&#x260E",
                    Title: "Telephone"
                }, {
                    Emoji: "&#x1F4DE",
                    Title: "Telephone Receiver"
                }, {
                    Emoji: "&#x1F4DF",
                    Title: "Pager"
                }, {
                    Emoji: "&#x1F4E0",
                    Title: "Fax Machine"
                }, {
                    Emoji: "&#x1F50B",
                    Title: "Battery"
                }, {
                    Emoji: "&#x1F50C",
                    Title: "Electric Plug"
                }, {
                    Emoji: "&#x1F4BB",
                    Title: "Laptop Computer"
                }, {
                    Emoji: "&#x1F5A5",
                    Title: "Desktop Computer"
                }, {
                    Emoji: "&#x1F5A8",
                    Title: "Printer"
                }, {
                    Emoji: "&#x2328",
                    Title: "Keyboard"
                }, {
                    Emoji: "&#x1F5B1",
                    Title: "Computer Mouse"
                }, {
                    Emoji: "&#x1F5B2",
                    Title: "Trackball"
                }, {
                    Emoji: "&#x1F4BD",
                    Title: "Computer Disk"
                }, {
                    Emoji: "&#x1F4BE",
                    Title: "Floppy Disk"
                }, {
                    Emoji: "&#x1F4BF",
                    Title: "Optical Disk"
                }, {
                    Emoji: "&#x1F4C0",
                    Title: "Dvd"
                }, {
                    Emoji: "&#x1F3A5",
                    Title: "Movie Camera"
                }, {
                    Emoji: "&#x1F39E",
                    Title: "Film Frames"
                }, {
                    Emoji: "&#x1F4FD",
                    Title: "Film Projector"
                }, {
                    Emoji: "&#x1F3AC",
                    Title: "Clapper Board"
                }, {
                    Emoji: "&#x1F4FA",
                    Title: "Television"
                }, {
                    Emoji: "&#x1F4F7",
                    Title: "Camera"
                }, {
                    Emoji: "&#x1F4F8",
                    Title: "Camera With Flash"
                }, {
                    Emoji: "&#x1F4F9",
                    Title: "Video Camera"
                }, {
                    Emoji: "&#x1F4FC",
                    Title: "Videocassette"
                }, {
                    Emoji: "&#x1F50D",
                    Title: "Left-Pointing Magnifying Glass"
                }, {
                    Emoji: "&#x1F50E",
                    Title: "Right-Pointing Magnifying Glass"
                }, {
                    Emoji: "&#x1F52C",
                    Title: "Microscope"
                }, {
                    Emoji: "&#x1F52D",
                    Title: "Telescope"
                }, {
                    Emoji: "&#x1F4E1",
                    Title: "Satellite Antenna"
                }, {
                    Emoji: "&#x1F56F",
                    Title: "Candle"
                }, {
                    Emoji: "&#x1F4A1",
                    Title: "Light Bulb"
                }, {
                    Emoji: "&#x1F526",
                    Title: "Flashlight"
                }, {
                    Emoji: "&#x1F3EE",
                    Title: "Red Paper Lantern"
                }, {
                    Emoji: "&#x1F4D4",
                    Title: "Notebook With Decorative Cover"
                }, {
                    Emoji: "&#x1F4D5",
                    Title: "Closed Book"
                }, {
                    Emoji: "&#x1F4D6",
                    Title: "Open Book"
                }, {
                    Emoji: "&#x1F4D7",
                    Title: "Green Book"
                }, {
                    Emoji: "&#x1F4D8",
                    Title: "Blue Book"
                }, {
                    Emoji: "&#x1F4D9",
                    Title: "Orange Book"
                }, {
                    Emoji: "&#x1F4DA",
                    Title: "Books"
                }, {
                    Emoji: "&#x1F4D3",
                    Title: "Notebook"
                }, {
                    Emoji: "&#x1F4D2",
                    Title: "Ledger"
                }, {
                    Emoji: "&#x1F4C3",
                    Title: "Page With Curl"
                }, {
                    Emoji: "&#x1F4DC",
                    Title: "Scroll"
                }, {
                    Emoji: "&#x1F4C4",
                    Title: "Page Facing Up"
                }, {
                    Emoji: "&#x1F4F0",
                    Title: "Newspaper"
                }, {
                    Emoji: "&#x1F5DE",
                    Title: "Rolled-Up Newspaper"
                }, {
                    Emoji: "&#x1F4D1",
                    Title: "Bookmark Tabs"
                }, {
                    Emoji: "&#x1F516",
                    Title: "Bookmark"
                }, {
                    Emoji: "&#x1F3F7",
                    Title: "Label"
                }, {
                    Emoji: "&#x1F4B0",
                    Title: "Money Bag"
                }, {
                    Emoji: "&#x1F4B4",
                    Title: "Yen Banknote"
                }, {
                    Emoji: "&#x1F4B5",
                    Title: "Dollar Banknote"
                }, {
                    Emoji: "&#x1F4B6",
                    Title: "Euro Banknote"
                }, {
                    Emoji: "&#x1F4B7",
                    Title: "Pound Banknote"
                }, {
                    Emoji: "&#x1F4B8",
                    Title: "Money With Wings"
                }, {
                    Emoji: "&#x1F4B3",
                    Title: "Credit Card"
                }, {
                    Emoji: "&#x1F4B9",
                    Title: "Chart Increasing With Yen"
                }, {
                    Emoji: "&#x1F4B1",
                    Title: "Currency Exchange"
                }, {
                    Emoji: "&#x1F4B2",
                    Title: "Heavy Dollar Sign"
                }, {
                    Emoji: "&#x2709",
                    Title: "Envelope"
                }, {
                    Emoji: "&#x1F4E7",
                    Title: "E-Mail"
                }, {
                    Emoji: "&#x1F4E8",
                    Title: "Incoming Envelope"
                }, {
                    Emoji: "&#x1F4E9",
                    Title: "Envelope With Arrow"
                }, {
                    Emoji: "&#x1F4E4",
                    Title: "Outbox Tray"
                }, {
                    Emoji: "&#x1F4E5",
                    Title: "Inbox Tray"
                }, {
                    Emoji: "&#x1F4E6",
                    Title: "Package"
                }, {
                    Emoji: "&#x1F4EB",
                    Title: "Closed Mailbox With Raised Flag"
                }, {
                    Emoji: "&#x1F4EA",
                    Title: "Closed Mailbox With Lowered Flag"
                }, {
                    Emoji: "&#x1F4EC",
                    Title: "Open Mailbox With Raised Flag"
                }, {
                    Emoji: "&#x1F4ED",
                    Title: "Open Mailbox With Lowered Flag"
                }, {
                    Emoji: "&#x1F4EE",
                    Title: "Postbox"
                }, {
                    Emoji: "&#x1F5F3",
                    Title: "Ballot Box With Ballot"
                }, {
                    Emoji: "&#x270F",
                    Title: "Pencil"
                }, {
                    Emoji: "&#x2712",
                    Title: "Black Nib"
                }, {
                    Emoji: "&#x1F58B",
                    Title: "Fountain Pen"
                }, {
                    Emoji: "&#x1F58A",
                    Title: "Pen"
                }, {
                    Emoji: "&#x1F58C",
                    Title: "Paintbrush"
                }, {
                    Emoji: "&#x1F58D",
                    Title: "Crayon"
                }, {
                    Emoji: "&#x1F4DD",
                    Title: "Memo"
                }, {
                    Emoji: "&#x1F4BC",
                    Title: "Briefcase"
                }, {
                    Emoji: "&#x1F4C1",
                    Title: "File Folder"
                }, {
                    Emoji: "&#x1F4C2",
                    Title: "Open File Folder"
                }, {
                    Emoji: "&#x1F5C2",
                    Title: "Card Index Dividers"
                }, {
                    Emoji: "&#x1F4C5",
                    Title: "Calendar"
                }, {
                    Emoji: "&#x1F4C6",
                    Title: "Tear-Off Calendar"
                }, {
                    Emoji: "&#x1F5D2",
                    Title: "Spiral Notepad"
                }, {
                    Emoji: "&#x1F5D3",
                    Title: "Spiral Calendar"
                }, {
                    Emoji: "&#x1F4C7",
                    Title: "Card Index"
                }, {
                    Emoji: "&#x1F4C8",
                    Title: "Chart Increasing"
                }, {
                    Emoji: "&#x1F4C9",
                    Title: "Chart Decreasing"
                }, {
                    Emoji: "&#x1F4CA",
                    Title: "Bar Chart"
                }, {
                    Emoji: "&#x1F4CB",
                    Title: "Clipboard"
                }, {
                    Emoji: "&#x1F4CC",
                    Title: "Pushpin"
                }, {
                    Emoji: "&#x1F4CD",
                    Title: "Round Pushpin"
                }, {
                    Emoji: "&#x1F4CE",
                    Title: "Paperclip"
                }, {
                    Emoji: "&#x1F587",
                    Title: "Linked Paperclips"
                }, {
                    Emoji: "&#x1F4CF",
                    Title: "Straight Ruler"
                }, {
                    Emoji: "&#x1F4D0",
                    Title: "Triangular Ruler"
                }, {
                    Emoji: "&#x2702",
                    Title: "Scissors"
                }, {
                    Emoji: "&#x1F5C3",
                    Title: "Card File Box"
                }, {
                    Emoji: "&#x1F5C4",
                    Title: "File Cabinet"
                }, {
                    Emoji: "&#x1F5D1",
                    Title: "Wastebasket"
                }, {
                    Emoji: "&#x1F512",
                    Title: "Locked"
                }, {
                    Emoji: "&#x1F513",
                    Title: "Unlocked"
                }, {
                    Emoji: "&#x1F50F",
                    Title: "Locked With Pen"
                }, {
                    Emoji: "&#x1F510",
                    Title: "Locked With Key"
                }, {
                    Emoji: "&#x1F511",
                    Title: "Key"
                }, {
                    Emoji: "&#x1F5DD",
                    Title: "Old Key"
                }, {
                    Emoji: "&#x1F528",
                    Title: "Hammer"
                }, {
                    Emoji: "&#x26CF",
                    Title: "Pick"
                }, {
                    Emoji: "&#x2692",
                    Title: "Hammer And Pick"
                }, {
                    Emoji: "&#x1F6E0",
                    Title: "Hammer And Wrench"
                }, {
                    Emoji: "&#x1F5E1",
                    Title: "Dagger"
                }, {
                    Emoji: "&#x2694",
                    Title: "Crossed Swords"
                }, {
                    Emoji: "&#x1F52B",
                    Title: "Pistol"
                }, {
                    Emoji: "&#x1F3F9",
                    Title: "Bow And Arrow"
                }, {
                    Emoji: "&#x1F6E1",
                    Title: "Shield"
                }, {
                    Emoji: "&#x1F527",
                    Title: "Wrench"
                }, {
                    Emoji: "&#x1F529",
                    Title: "Nut And Bolt"
                }, {
                    Emoji: "&#x2699",
                    Title: "Gear"
                }, {
                    Emoji: "&#x1F5DC",
                    Title: "Clamp"
                }, {
                    Emoji: "&#x2697",
                    Title: "Alembic"
                }, {
                    Emoji: "&#x2696",
                    Title: "Balance Scale"
                }, {
                    Emoji: "&#x1F517",
                    Title: "Link"
                }, {
                    Emoji: "&#x26D3",
                    Title: "Chains"
                }, {
                    Emoji: "&#x1F489",
                    Title: "Syringe"
                }, {
                    Emoji: "&#x1F48A",
                    Title: "Pill"
                }, {
                    Emoji: "&#x1F6AC",
                    Title: "Cigarette"
                }, {
                    Emoji: "&#x26B0",
                    Title: "Coffin"
                }, {
                    Emoji: "&#x26B1",
                    Title: "Funeral Urn"
                }, {
                    Emoji: "&#x1F5FF",
                    Title: "Moai"
                }, {
                    Emoji: "&#x1F6E2",
                    Title: "Oil Drum"
                }, {
                    Emoji: "&#x1F52E",
                    Title: "Crystal Ball"
                }, {
                    Emoji: "&#x1F6D2",
                    Title: "Shopping Cart"
                }, {
                    Emoji: "&#x1F3E7",
                    Title: "ATM Sign"
                }, {
                    Emoji: "&#x1F6AE",
                    Title: "Litter In Bin Sign"
                }, {
                    Emoji: "&#x1F6B0",
                    Title: "Potable Water"
                }, {
                    Emoji: "&#x267F",
                    Title: "Wheelchair Symbol"
                }, {
                    Emoji: "&#x1F6B9",
                    Title: "Men’s Room"
                }, {
                    Emoji: "&#x1F6BA",
                    Title: "Women’s Room"
                }, {
                    Emoji: "&#x1F6BB",
                    Title: "Restroom"
                }, {
                    Emoji: "&#x1F6BC",
                    Title: "Baby Symbol"
                }, {
                    Emoji: "&#x1F6BE",
                    Title: "Water Closet"
                }, {
                    Emoji: "&#x1F6C2",
                    Title: "Passport Control"
                }, {
                    Emoji: "&#x1F6C3",
                    Title: "Customs"
                }, {
                    Emoji: "&#x1F6C4",
                    Title: "Baggage Claim"
                }, {
                    Emoji: "&#x1F6C5",
                    Title: "Left Luggage"
                }, {
                    Emoji: "&#x26A0",
                    Title: "Warning"
                }, {
                    Emoji: "&#x1F6B8",
                    Title: "Children Crossing"
                }, {
                    Emoji: "&#x26D4",
                    Title: "No Entry"
                }, {
                    Emoji: "&#x1F6AB",
                    Title: "Prohibited"
                }, {
                    Emoji: "&#x1F6B3",
                    Title: "No Bicycles"
                }, {
                    Emoji: "&#x1F6AD",
                    Title: "No Smoking"
                }, {
                    Emoji: "&#x1F6AF",
                    Title: "No Littering"
                }, {
                    Emoji: "&#x1F6B1",
                    Title: "Non-Potable Water"
                }, {
                    Emoji: "&#x1F6B7",
                    Title: "No Pedestrians"
                }, {
                    Emoji: "&#x1F4F5",
                    Title: "No Mobile Phones"
                }, {
                    Emoji: "&#x1F51E",
                    Title: "No One Under Eighteen"
                }, {
                    Emoji: "&#x2622",
                    Title: "Radioactive"
                }, {
                    Emoji: "&#x2623",
                    Title: "Biohazard"
                }, {
                    Emoji: "&#x2B06",
                    Title: "Up Arrow"
                }, {
                    Emoji: "&#x2197",
                    Title: "Up-Right Arrow"
                }, {
                    Emoji: "&#x27A1",
                    Title: "Right Arrow"
                }, {
                    Emoji: "&#x2198",
                    Title: "Down-Right Arrow"
                }, {
                    Emoji: "&#x2B07",
                    Title: "Down Arrow"
                }, {
                    Emoji: "&#x2199",
                    Title: "Down-Left Arrow"
                }, {
                    Emoji: "&#x2B05",
                    Title: "Left Arrow"
                }, {
                    Emoji: "&#x2196",
                    Title: "Up-Left Arrow"
                }, {
                    Emoji: "&#x2195",
                    Title: "Up-Down Arrow"
                }, {
                    Emoji: "&#x2194",
                    Title: "Left-Right Arrow"
                }, {
                    Emoji: "&#x21A9",
                    Title: "Right Arrow Curving Left"
                }, {
                    Emoji: "&#x21AA",
                    Title: "Left Arrow Curving Right"
                }, {
                    Emoji: "&#x2934",
                    Title: "Right Arrow Curving Up"
                }, {
                    Emoji: "&#x2935",
                    Title: "Right Arrow Curving Down"
                }, {
                    Emoji: "&#x1F503",
                    Title: "Clockwise Vertical Arrows"
                }, {
                    Emoji: "&#x1F504",
                    Title: "Anticlockwise Arrows Button"
                }, {
                    Emoji: "&#x1F519",
                    Title: "BACK Arrow"
                }, {
                    Emoji: "&#x1F51A",
                    Title: "END Arrow"
                }, {
                    Emoji: "&#x1F51B",
                    Title: "ON! Arrow"
                }, {
                    Emoji: "&#x1F51C",
                    Title: "SOON Arrow"
                }, {
                    Emoji: "&#x1F51D",
                    Title: "TOP Arrow"
                }, {
                    Emoji: "&#x1F6D0",
                    Title: "Place Of Worship"
                }, {
                    Emoji: "&#x269B",
                    Title: "Atom Symbol"
                }, {
                    Emoji: "&#x1F549",
                    Title: "Om"
                }, {
                    Emoji: "&#x2721",
                    Title: "Star Of David"
                }, {
                    Emoji: "&#x2638",
                    Title: "Wheel Of Dharma"
                }, {
                    Emoji: "&#x262F",
                    Title: "Yin Yang"
                }, {
                    Emoji: "&#x271D",
                    Title: "Latin Cross"
                }, {
                    Emoji: "&#x2626",
                    Title: "Orthodox Cross"
                }, {
                    Emoji: "&#x262A",
                    Title: "Star And Crescent"
                }, {
                    Emoji: "&#x262E",
                    Title: "Peace Symbol"
                }, {
                    Emoji: "&#x1F54E",
                    Title: "Menorah"
                }, {
                    Emoji: "&#x1F52F",
                    Title: "Dotted Six-Pointed Star"
                }, {
                    Emoji: "&#x2648",
                    Title: "Aries"
                }, {
                    Emoji: "&#x2649",
                    Title: "Taurus"
                }, {
                    Emoji: "&#x264A",
                    Title: "Gemini"
                }, {
                    Emoji: "&#x264B",
                    Title: "Cancer"
                }, {
                    Emoji: "&#x264C",
                    Title: "Leo"
                }, {
                    Emoji: "&#x264D",
                    Title: "Virgo"
                }, {
                    Emoji: "&#x264E",
                    Title: "Libra"
                }, {
                    Emoji: "&#x264F",
                    Title: "Scorpius"
                }, {
                    Emoji: "&#x2650",
                    Title: "Sagittarius"
                }, {
                    Emoji: "&#x2651",
                    Title: "Capricorn"
                }, {
                    Emoji: "&#x2652",
                    Title: "Aquarius"
                }, {
                    Emoji: "&#x2653",
                    Title: "Pisces"
                }, {
                    Emoji: "&#x26CE",
                    Title: "Ophiuchus"
                }, {
                    Emoji: "&#x1F500",
                    Title: "Shuffle Tracks Button"
                }, {
                    Emoji: "&#x1F501",
                    Title: "Repeat Button"
                }, {
                    Emoji: "&#x1F502",
                    Title: "Repeat Single Button"
                }, {
                    Emoji: "&#x25B6",
                    Title: "Play Button"
                }, {
                    Emoji: "&#x23E9",
                    Title: "Fast-Forward Button"
                }, {
                    Emoji: "&#x23ED",
                    Title: "Next Track Button"
                }, {
                    Emoji: "&#x23EF",
                    Title: "Play Or Pause Button"
                }, {
                    Emoji: "&#x25C0",
                    Title: "Reverse Button"
                }, {
                    Emoji: "&#x23EA",
                    Title: "Fast Reverse Button"
                }, {
                    Emoji: "&#x23EE",
                    Title: "Last Track Button"
                }, {
                    Emoji: "&#x1F53C",
                    Title: "Up Button"
                }, {
                    Emoji: "&#x23EB",
                    Title: "Fast Up Button"
                }, {
                    Emoji: "&#x1F53D",
                    Title: "Down Button"
                }, {
                    Emoji: "&#x23EC",
                    Title: "Fast Down Button"
                }, {
                    Emoji: "&#x23F8",
                    Title: "Pause Button"
                }, {
                    Emoji: "&#x23F9",
                    Title: "Stop Button"
                }, {
                    Emoji: "&#x23FA",
                    Title: "Record Button"
                }, {
                    Emoji: "&#x23CF",
                    Title: "Eject Button"
                }, {
                    Emoji: "&#x1F3A6",
                    Title: "Cinema"
                }, {
                    Emoji: "&#x1F505",
                    Title: "Dim Button"
                }, {
                    Emoji: "&#x1F506",
                    Title: "Bright Button"
                }, {
                    Emoji: "&#x1F4F6",
                    Title: "Antenna Bars"
                }, {
                    Emoji: "&#x1F4F3",
                    Title: "Vibration Mode"
                }, {
                    Emoji: "&#x1F4F4",
                    Title: "Mobile Phone Off"
                }, {
                    Emoji: "&#x267B",
                    Title: "Recycling Symbol"
                }, {
                    Emoji: "&#x1F4DB",
                    Title: "Name Badge"
                }, {
                    Emoji: "&#x269C",
                    Title: "Fleur-De-Lis"
                }, {
                    Emoji: "&#x1F530",
                    Title: "Japanese Symbol For Beginner"
                }, {
                    Emoji: "&#x1F531",
                    Title: "Trident Emblem"
                }, {
                    Emoji: "&#x2B55",
                    Title: "Heavy Large Circle"
                }, {
                    Emoji: "&#x2705",
                    Title: "White Heavy Check Mark"
                }, {
                    Emoji: "&#x2611",
                    Title: "Ballot Box With Check"
                }, {
                    Emoji: "&#x2714",
                    Title: "Heavy Check Mark"
                }, {
                    Emoji: "&#x2716",
                    Title: "Heavy Multiplication X"
                }, {
                    Emoji: "&#x274C",
                    Title: "Cross Mark"
                }, {
                    Emoji: "&#x274E",
                    Title: "Cross Mark Button"
                }, {
                    Emoji: "&#x2795",
                    Title: "Heavy Plus Sign"
                }, {
                    Emoji: "&#x2640",
                    Title: "Female Sign"
                }, {
                    Emoji: "&#x2642",
                    Title: "Male Sign"
                }, {
                    Emoji: "&#x2695",
                    Title: "Medical Symbol"
                }, {
                    Emoji: "&#x2796",
                    Title: "Heavy Minus Sign"
                }, {
                    Emoji: "&#x2797",
                    Title: "Heavy Division Sign"
                }, {
                    Emoji: "&#x27B0",
                    Title: "Curly Loop"
                }, {
                    Emoji: "&#x27BF",
                    Title: "Double Curly Loop"
                }, {
                    Emoji: "&#x303D",
                    Title: "Part Alternation Mark"
                }, {
                    Emoji: "&#x2733",
                    Title: "Eight-Spoked Asterisk"
                }, {
                    Emoji: "&#x2734",
                    Title: "Eight-Pointed Star"
                }, {
                    Emoji: "&#x2747",
                    Title: "Sparkle"
                }, {
                    Emoji: "&#x203C",
                    Title: "Double Exclamation Mark"
                }, {
                    Emoji: "&#x2049",
                    Title: "Exclamation Question Mark"
                }, {
                    Emoji: "&#x2753",
                    Title: "Question Mark"
                }, {
                    Emoji: "&#x2754",
                    Title: "White Question Mark"
                }, {
                    Emoji: "&#x2755",
                    Title: "White Exclamation Mark"
                }, {
                    Emoji: "&#x2757",
                    Title: "Exclamation Mark"
                }, {
                    Emoji: "&#x3030",
                    Title: "Wavy Dash"
                }, {
                    Emoji: "&#x00A9",
                    Title: "Copyright"
                }, {
                    Emoji: "&#x00AE",
                    Title: "Registered"
                }, {
                    Emoji: "&#x2122",
                    Title: "Trade Mark"
                }, {
                    Emoji: "&#x0023&#xFE0F&#x20E3",
                    Title: "Keycap: #"
                }, {
                    Emoji: "&#x002A&#xFE0F&#x20E3",
                    Title: "Keycap: *"
                }, {
                    Emoji: "&#x0030&#xFE0F&#x20E3",
                    Title: "Keycap: 0"
                }, {
                    Emoji: "&#x0031&#xFE0F&#x20E3",
                    Title: "Keycap: 1"
                }, {
                    Emoji: "&#x0032&#xFE0F&#x20E3",
                    Title: "Keycap: 2"
                }, {
                    Emoji: "&#x0033&#xFE0F&#x20E3",
                    Title: "Keycap: 3"
                }, {
                    Emoji: "&#x0034&#xFE0F&#x20E3",
                    Title: "Keycap: 4"
                }, {
                    Emoji: "&#x0035&#xFE0F&#x20E3",
                    Title: "Keycap: 5"
                }, {
                    Emoji: "&#x0036&#xFE0F&#x20E3",
                    Title: "Keycap: 6"
                }, {
                    Emoji: "&#x0037&#xFE0F&#x20E3",
                    Title: "Keycap: 7"
                }, {
                    Emoji: "&#x0038&#xFE0F&#x20E3",
                    Title: "Keycap: 8"
                }, {
                    Emoji: "&#x0039&#xFE0F&#x20E3",
                    Title: "Keycap: 9"
                }, {
                    Emoji: "&#x1F51F",
                    Title: "Keycap 10"
                }, {
                    Emoji: "&#x1F4AF",
                    Title: "Hundred Points"
                }, {
                    Emoji: "&#x1F520",
                    Title: "Input Latin Uppercase"
                }, {
                    Emoji: "&#x1F521",
                    Title: "Input Latin Lowercase"
                }, {
                    Emoji: "&#x1F522",
                    Title: "Input Numbers"
                }, {
                    Emoji: "&#x1F523",
                    Title: "Input Symbols"
                }, {
                    Emoji: "&#x1F524",
                    Title: "Input Latin Letters"
                }, {
                    Emoji: "&#x1F170",
                    Title: "A Button (blood Type)"
                }, {
                    Emoji: "&#x1F18E",
                    Title: "AB Button (blood Type)"
                }, {
                    Emoji: "&#x1F171",
                    Title: "B Button (blood Type)"
                }, {
                    Emoji: "&#x1F191",
                    Title: "CL Button"
                }, {
                    Emoji: "&#x1F192",
                    Title: "COOL Button"
                }, {
                    Emoji: "&#x1F193",
                    Title: "FREE Button"
                }, {
                    Emoji: "&#x2139",
                    Title: "Information"
                }, {
                    Emoji: "&#x1F194",
                    Title: "ID Button"
                }, {
                    Emoji: "&#x24C2",
                    Title: "Circled M"
                }, {
                    Emoji: "&#x1F195",
                    Title: "NEW Button"
                }, {
                    Emoji: "&#x1F196",
                    Title: "NG Button"
                }, {
                    Emoji: "&#x1F17E",
                    Title: "O Button (blood Type)"
                }, {
                    Emoji: "&#x1F197",
                    Title: "OK Button"
                }, {
                    Emoji: "&#x1F17F",
                    Title: "P Button"
                }, {
                    Emoji: "&#x1F198",
                    Title: "SOS Button"
                }, {
                    Emoji: "&#x1F199",
                    Title: "UP! Button"
                }, {
                    Emoji: "&#x1F19A",
                    Title: "VS Button"
                }, {
                    Emoji: "&#x1F201",
                    Title: "Japanese “here” Button"
                }, {
                    Emoji: "&#x1F202",
                    Title: "Japanese “service Charge” Button"
                }, {
                    Emoji: "&#x1F237",
                    Title: "Japanese “monthly Amount” Button"
                }, {
                    Emoji: "&#x1F236",
                    Title: "Japanese “not Free Of Charge” Button"
                }, {
                    Emoji: "&#x1F22F",
                    Title: "Japanese “reserved” Button"
                }, {
                    Emoji: "&#x1F250",
                    Title: "Japanese “bargain” Button"
                }, {
                    Emoji: "&#x1F239",
                    Title: "Japanese “discount” Button"
                }, {
                    Emoji: "&#x1F21A",
                    Title: "Japanese “free Of Charge” Button"
                }, {
                    Emoji: "&#x1F232",
                    Title: "Japanese “prohibited” Button"
                }, {
                    Emoji: "&#x1F251",
                    Title: "Japanese “acceptable” Button"
                }, {
                    Emoji: "&#x1F238",
                    Title: "Japanese “application” Button"
                }, {
                    Emoji: "&#x1F234",
                    Title: "Japanese “passing Grade” Button"
                }, {
                    Emoji: "&#x1F233",
                    Title: "Japanese “vacancy” Button"
                }, {
                    Emoji: "&#x3297",
                    Title: "Japanese “congratulations” Button"
                }, {
                    Emoji: "&#x3299",
                    Title: "Japanese “secret” Button"
                }, {
                    Emoji: "&#x1F23A",
                    Title: "Japanese “open For Business” Button"
                }, {
                    Emoji: "&#x1F235",
                    Title: "Japanese “no Vacancy” Button"
                }, {
                    Emoji: "&#x25AA",
                    Title: "Black Small Square"
                }, {
                    Emoji: "&#x25AB",
                    Title: "White Small Square"
                }, {
                    Emoji: "&#x25FB",
                    Title: "White Medium Square"
                }, {
                    Emoji: "&#x25FC",
                    Title: "Black Medium Square"
                }, {
                    Emoji: "&#x25FD",
                    Title: "White Medium-Small Square"
                }, {
                    Emoji: "&#x25FE",
                    Title: "Black Medium-Small Square"
                }, {
                    Emoji: "&#x2B1B",
                    Title: "Black Large Square"
                }, {
                    Emoji: "&#x2B1C",
                    Title: "White Large Square"
                }, {
                    Emoji: "&#x1F536",
                    Title: "Large Orange Diamond"
                }, {
                    Emoji: "&#x1F537",
                    Title: "Large Blue Diamond"
                }, {
                    Emoji: "&#x1F538",
                    Title: "Small Orange Diamond"
                }, {
                    Emoji: "&#x1F539",
                    Title: "Small Blue Diamond"
                }, {
                    Emoji: "&#x1F53A",
                    Title: "Red Triangle Pointed Up"
                }, {
                    Emoji: "&#x1F53B",
                    Title: "Red Triangle Pointed Down"
                }, {
                    Emoji: "&#x1F4A0",
                    Title: "Diamond With A Dot"
                }, {
                    Emoji: "&#x1F518",
                    Title: "Radio Button"
                }, {
                    Emoji: "&#x1F532",
                    Title: "Black Square Button"
                }, {
                    Emoji: "&#x1F533",
                    Title: "White Square Button"
                }, {
                    Emoji: "&#x26AA",
                    Title: "White Circle"
                }, {
                    Emoji: "&#x26AB",
                    Title: "Black Circle"
                }, {
                    Emoji: "&#x1F534",
                    Title: "Red Circle"
                }, {
                    Emoji: "&#x1F535",
                    Title: "Blue Circle"
                }, {
                    Emoji: "&#x1F3C1",
                    Title: "Chequered Flag"
                }, {
                    Emoji: "&#x1F6A9",
                    Title: "Triangular Flag"
                }, {
                    Emoji: "&#x1F38C",
                    Title: "Crossed Flags"
                }, {
                    Emoji: "&#x1F3F4",
                    Title: "Black Flag"
                }, {
                    Emoji: "&#x1F3F3",
                    Title: "White Flag"
                }, {
                    Emoji: "&#x1F3F3&#xFE0F&#x200D&#x1F308",
                    Title: "Rainbow Flag"
                }, {
                    Emoji: "&#x1F1E6&#x1F1E8",
                    Title: "Ascension Island"
                }, {
                    Emoji: "&#x1F1E6&#x1F1E9",
                    Title: "Andorra"
                }, {
                    Emoji: "&#x1F1E6&#x1F1EA",
                    Title: "United Arab Emirates"
                }, {
                    Emoji: "&#x1F1E6&#x1F1EB",
                    Title: "Afghanistan"
                }, {
                    Emoji: "&#x1F1E6&#x1F1EC",
                    Title: "Antigua & Barbuda"
                }, {
                    Emoji: "&#x1F1E6&#x1F1EE",
                    Title: "Anguilla"
                }, {
                    Emoji: "&#x1F1E6&#x1F1F1",
                    Title: "Albania"
                }, {
                    Emoji: "&#x1F1E6&#x1F1F2",
                    Title: "Armenia"
                }, {
                    Emoji: "&#x1F1E6&#x1F1F4",
                    Title: "Angola"
                }, {
                    Emoji: "&#x1F1E6&#x1F1F6",
                    Title: "Antarctica"
                }, {
                    Emoji: "&#x1F1E6&#x1F1F7",
                    Title: "Argentina"
                }, {
                    Emoji: "&#x1F1E6&#x1F1F8",
                    Title: "American Samoa"
                }, {
                    Emoji: "&#x1F1E6&#x1F1F9",
                    Title: "Austria"
                }, {
                    Emoji: "&#x1F1E6&#x1F1FA",
                    Title: "Australia"
                }, {
                    Emoji: "&#x1F1E6&#x1F1FC",
                    Title: "Aruba"
                }, {
                    Emoji: "&#x1F1E6&#x1F1FD",
                    Title: "Åland Islands"
                }, {
                    Emoji: "&#x1F1E6&#x1F1FF",
                    Title: "Azerbaijan"
                }, {
                    Emoji: "&#x1F1E7&#x1F1E6",
                    Title: "Bosnia & Herzegovina"
                }, {
                    Emoji: "&#x1F1E7&#x1F1E7",
                    Title: "Barbados"
                }, {
                    Emoji: "&#x1F1E7&#x1F1E9",
                    Title: "Bangladesh"
                }, {
                    Emoji: "&#x1F1E7&#x1F1EA",
                    Title: "Belgium"
                }, {
                    Emoji: "&#x1F1E7&#x1F1EB",
                    Title: "Burkina Faso"
                }, {
                    Emoji: "&#x1F1E7&#x1F1EC",
                    Title: "Bulgaria"
                }, {
                    Emoji: "&#x1F1E7&#x1F1ED",
                    Title: "Bahrain"
                }, {
                    Emoji: "&#x1F1E7&#x1F1EE",
                    Title: "Burundi"
                }, {
                    Emoji: "&#x1F1E7&#x1F1EF",
                    Title: "Benin"
                }, {
                    Emoji: "&#x1F1E7&#x1F1F1",
                    Title: "St. Barthélemy"
                }, {
                    Emoji: "&#x1F1E7&#x1F1F2",
                    Title: "Bermuda"
                }, {
                    Emoji: "&#x1F1E7&#x1F1F3",
                    Title: "Brunei"
                }, {
                    Emoji: "&#x1F1E7&#x1F1F4",
                    Title: "Bolivia"
                }, {
                    Emoji: "&#x1F1E7&#x1F1F6",
                    Title: "Caribbean Netherlands"
                }, {
                    Emoji: "&#x1F1E7&#x1F1F7",
                    Title: "Brazil"
                }, {
                    Emoji: "&#x1F1E7&#x1F1F8",
                    Title: "Bahamas"
                }, {
                    Emoji: "&#x1F1E7&#x1F1F9",
                    Title: "Bhutan"
                }, {
                    Emoji: "&#x1F1E7&#x1F1FB",
                    Title: "Bouvet Island"
                }, {
                    Emoji: "&#x1F1E7&#x1F1FC",
                    Title: "Botswana"
                }, {
                    Emoji: "&#x1F1E7&#x1F1FE",
                    Title: "Belarus"
                }, {
                    Emoji: "&#x1F1E7&#x1F1FF",
                    Title: "Belize"
                }, {
                    Emoji: "&#x1F1E8&#x1F1E6",
                    Title: "Canada"
                }, {
                    Emoji: "&#x1F1E8&#x1F1E8",
                    Title: "Cocos (Keeling) Islands"
                }, {
                    Emoji: "&#x1F1E8&#x1F1E9",
                    Title: "Congo - Kinshasa"
                }, {
                    Emoji: "&#x1F1E8&#x1F1EB",
                    Title: "Central African Republic"
                }, {
                    Emoji: "&#x1F1E8&#x1F1EC",
                    Title: "Congo - Brazzaville"
                }, {
                    Emoji: "&#x1F1E8&#x1F1ED",
                    Title: "Switzerland"
                }, {
                    Emoji: "&#x1F1E8&#x1F1EE",
                    Title: "Côte D’Ivoire"
                }, {
                    Emoji: "&#x1F1E8&#x1F1F0",
                    Title: "Cook Islands"
                }, {
                    Emoji: "&#x1F1E8&#x1F1F1",
                    Title: "Chile"
                }, {
                    Emoji: "&#x1F1E8&#x1F1F2",
                    Title: "Cameroon"
                }, {
                    Emoji: "&#x1F1E8&#x1F1F3",
                    Title: "China"
                }, {
                    Emoji: "&#x1F1E8&#x1F1F4",
                    Title: "Colombia"
                }, {
                    Emoji: "&#x1F1E8&#x1F1F5",
                    Title: "Clipperton Island"
                }, {
                    Emoji: "&#x1F1E8&#x1F1F7",
                    Title: "Costa Rica"
                }, {
                    Emoji: "&#x1F1E8&#x1F1FA",
                    Title: "Cuba"
                }, {
                    Emoji: "&#x1F1E8&#x1F1FB",
                    Title: "Cape Verde"
                }, {
                    Emoji: "&#x1F1E8&#x1F1FC",
                    Title: "Curaçao"
                }, {
                    Emoji: "&#x1F1E8&#x1F1FD",
                    Title: "Christmas Island"
                }, {
                    Emoji: "&#x1F1E8&#x1F1FE",
                    Title: "Cyprus"
                }, {
                    Emoji: "&#x1F1E8&#x1F1FF",
                    Title: "Czech Republic"
                }, {
                    Emoji: "&#x1F1E9&#x1F1EA",
                    Title: "Germany"
                }, {
                    Emoji: "&#x1F1E9&#x1F1EC",
                    Title: "Diego Garcia"
                }, {
                    Emoji: "&#x1F1E9&#x1F1EF",
                    Title: "Djibouti"
                }, {
                    Emoji: "&#x1F1E9&#x1F1F0",
                    Title: "Denmark"
                }, {
                    Emoji: "&#x1F1E9&#x1F1F2",
                    Title: "Dominica"
                }, {
                    Emoji: "&#x1F1E9&#x1F1F4",
                    Title: "Dominican Republic"
                }, {
                    Emoji: "&#x1F1E9&#x1F1FF",
                    Title: "Algeria"
                }, {
                    Emoji: "&#x1F1EA&#x1F1E6",
                    Title: "Ceuta & Melilla"
                }, {
                    Emoji: "&#x1F1EA&#x1F1E8",
                    Title: "Ecuador"
                }, {
                    Emoji: "&#x1F1EA&#x1F1EA",
                    Title: "Estonia"
                }, {
                    Emoji: "&#x1F1EA&#x1F1EC",
                    Title: "Egypt"
                }, {
                    Emoji: "&#x1F1EA&#x1F1ED",
                    Title: "Western Sahara"
                }, {
                    Emoji: "&#x1F1EA&#x1F1F7",
                    Title: "Eritrea"
                }, {
                    Emoji: "&#x1F1EA&#x1F1F8",
                    Title: "Spain"
                }, {
                    Emoji: "&#x1F1EA&#x1F1F9",
                    Title: "Ethiopia"
                }, {
                    Emoji: "&#x1F1EA&#x1F1FA",
                    Title: "European Union"
                }, {
                    Emoji: "&#x1F1EB&#x1F1EE",
                    Title: "Finland"
                }, {
                    Emoji: "&#x1F1EB&#x1F1EF",
                    Title: "Fiji"
                }, {
                    Emoji: "&#x1F1EB&#x1F1F0",
                    Title: "Falkland Islands"
                }, {
                    Emoji: "&#x1F1EB&#x1F1F2",
                    Title: "Micronesia"
                }, {
                    Emoji: "&#x1F1EB&#x1F1F4",
                    Title: "Faroe Islands"
                }, {
                    Emoji: "&#x1F1EB&#x1F1F7",
                    Title: "France"
                }, {
                    Emoji: "&#x1F1EC&#x1F1E6",
                    Title: "Gabon"
                }, {
                    Emoji: "&#x1F1EC&#x1F1E7",
                    Title: "United Kingdom"
                }, {
                    Emoji: "&#x1F1EC&#x1F1E9",
                    Title: "Grenada"
                }, {
                    Emoji: "&#x1F1EC&#x1F1EA",
                    Title: "Georgia"
                }, {
                    Emoji: "&#x1F1EC&#x1F1EB",
                    Title: "French Guiana"
                }, {
                    Emoji: "&#x1F1EC&#x1F1EC",
                    Title: "Guernsey"
                }, {
                    Emoji: "&#x1F1EC&#x1F1ED",
                    Title: "Ghana"
                }, {
                    Emoji: "&#x1F1EC&#x1F1EE",
                    Title: "Gibraltar"
                }, {
                    Emoji: "&#x1F1EC&#x1F1F1",
                    Title: "Greenland"
                }, {
                    Emoji: "&#x1F1EC&#x1F1F2",
                    Title: "Gambia"
                }, {
                    Emoji: "&#x1F1EC&#x1F1F3",
                    Title: "Guinea"
                }, {
                    Emoji: "&#x1F1EC&#x1F1F5",
                    Title: "Guadeloupe"
                }, {
                    Emoji: "&#x1F1EC&#x1F1F6",
                    Title: "Equatorial Guinea"
                }, {
                    Emoji: "&#x1F1EC&#x1F1F7",
                    Title: "Greece"
                }, {
                    Emoji: "&#x1F1EC&#x1F1F8",
                    Title: "South Georgia & South Sandwich Islands"
                }, {
                    Emoji: "&#x1F1EC&#x1F1F9",
                    Title: "Guatemala"
                }, {
                    Emoji: "&#x1F1EC&#x1F1FA",
                    Title: "Guam"
                }, {
                    Emoji: "&#x1F1EC&#x1F1FC",
                    Title: "Guinea-Bissau"
                }, {
                    Emoji: "&#x1F1EC&#x1F1FE",
                    Title: "Guyana"
                }, {
                    Emoji: "&#x1F1ED&#x1F1F0",
                    Title: "Hong Kong SAR China"
                }, {
                    Emoji: "&#x1F1ED&#x1F1F2",
                    Title: "Heard & McDonald Islands"
                }, {
                    Emoji: "&#x1F1ED&#x1F1F3",
                    Title: "Honduras"
                }, {
                    Emoji: "&#x1F1ED&#x1F1F7",
                    Title: "Croatia"
                }, {
                    Emoji: "&#x1F1ED&#x1F1F9",
                    Title: "Haiti"
                }, {
                    Emoji: "&#x1F1ED&#x1F1FA",
                    Title: "Hungary"
                }, {
                    Emoji: "&#x1F1EE&#x1F1E8",
                    Title: "Canary Islands"
                }, {
                    Emoji: "&#x1F1EE&#x1F1E9",
                    Title: "Indonesia"
                }, {
                    Emoji: "&#x1F1EE&#x1F1EA",
                    Title: "Ireland"
                }, {
                    Emoji: "&#x1F1EE&#x1F1F1",
                    Title: "Israel"
                }, {
                    Emoji: "&#x1F1EE&#x1F1F2",
                    Title: "Isle Of Man"
                }, {
                    Emoji: "&#x1F1EE&#x1F1F3",
                    Title: "India"
                }, {
                    Emoji: "&#x1F1EE&#x1F1F4",
                    Title: "British Indian Ocean Territory"
                }, {
                    Emoji: "&#x1F1EE&#x1F1F6",
                    Title: "Iraq"
                }, {
                    Emoji: "&#x1F1EE&#x1F1F7",
                    Title: "Iran"
                }, {
                    Emoji: "&#x1F1EE&#x1F1F8",
                    Title: "Iceland"
                }, {
                    Emoji: "&#x1F1EE&#x1F1F9",
                    Title: "Italy"
                }, {
                    Emoji: "&#x1F1EF&#x1F1EA",
                    Title: "Jersey"
                }, {
                    Emoji: "&#x1F1EF&#x1F1F2",
                    Title: "Jamaica"
                }, {
                    Emoji: "&#x1F1EF&#x1F1F4",
                    Title: "Jordan"
                }, {
                    Emoji: "&#x1F1EF&#x1F1F5",
                    Title: "Japan"
                }, {
                    Emoji: "&#x1F1F0&#x1F1EA",
                    Title: "Kenya"
                }, {
                    Emoji: "&#x1F1F0&#x1F1EC",
                    Title: "Kyrgyzstan"
                }, {
                    Emoji: "&#x1F1F0&#x1F1ED",
                    Title: "Cambodia"
                }, {
                    Emoji: "&#x1F1F0&#x1F1EE",
                    Title: "Kiribati"
                }, {
                    Emoji: "&#x1F1F0&#x1F1F2",
                    Title: "Comoros"
                }, {
                    Emoji: "&#x1F1F0&#x1F1F3",
                    Title: "St. Kitts & Nevis"
                }, {
                    Emoji: "&#x1F1F0&#x1F1F5",
                    Title: "North Korea"
                }, {
                    Emoji: "&#x1F1F0&#x1F1F7",
                    Title: "South Korea"
                }, {
                    Emoji: "&#x1F1F0&#x1F1FC",
                    Title: "Kuwait"
                }, {
                    Emoji: "&#x1F1F0&#x1F1FE",
                    Title: "Cayman Islands"
                }, {
                    Emoji: "&#x1F1F0&#x1F1FF",
                    Title: "Kazakhstan"
                }, {
                    Emoji: "&#x1F1F1&#x1F1E6",
                    Title: "Laos"
                }, {
                    Emoji: "&#x1F1F1&#x1F1E7",
                    Title: "Lebanon"
                }, {
                    Emoji: "&#x1F1F1&#x1F1E8",
                    Title: "St. Lucia"
                }, {
                    Emoji: "&#x1F1F1&#x1F1EE",
                    Title: "Liechtenstein"
                }, {
                    Emoji: "&#x1F1F1&#x1F1F0",
                    Title: "Sri Lanka"
                }, {
                    Emoji: "&#x1F1F1&#x1F1F7",
                    Title: "Liberia"
                }, {
                    Emoji: "&#x1F1F1&#x1F1F8",
                    Title: "Lesotho"
                }, {
                    Emoji: "&#x1F1F1&#x1F1F9",
                    Title: "Lithuania"
                }, {
                    Emoji: "&#x1F1F1&#x1F1FA",
                    Title: "Luxembourg"
                }, {
                    Emoji: "&#x1F1F1&#x1F1FB",
                    Title: "Latvia"
                }, {
                    Emoji: "&#x1F1F1&#x1F1FE",
                    Title: "Libya"
                }, {
                    Emoji: "&#x1F1F2&#x1F1E6",
                    Title: "Morocco"
                }, {
                    Emoji: "&#x1F1F2&#x1F1E8",
                    Title: "Monaco"
                }, {
                    Emoji: "&#x1F1F2&#x1F1E9",
                    Title: "Moldova"
                }, {
                    Emoji: "&#x1F1F2&#x1F1EA",
                    Title: "Montenegro"
                }, {
                    Emoji: "&#x1F1F2&#x1F1EB",
                    Title: "St. Martin"
                }, {
                    Emoji: "&#x1F1F2&#x1F1EC",
                    Title: "Madagascar"
                }, {
                    Emoji: "&#x1F1F2&#x1F1ED",
                    Title: "Marshall Islands"
                }, {
                    Emoji: "&#x1F1F2&#x1F1F0",
                    Title: "Macedonia"
                }, {
                    Emoji: "&#x1F1F2&#x1F1F1",
                    Title: "Mali"
                }, {
                    Emoji: "&#x1F1F2&#x1F1F2",
                    Title: "Myanmar (Burma)"
                }, {
                    Emoji: "&#x1F1F2&#x1F1F3",
                    Title: "Mongolia"
                }, {
                    Emoji: "&#x1F1F2&#x1F1F4",
                    Title: "Macau SAR China"
                }, {
                    Emoji: "&#x1F1F2&#x1F1F5",
                    Title: "Northern Mariana Islands"
                }, {
                    Emoji: "&#x1F1F2&#x1F1F6",
                    Title: "Martinique"
                }, {
                    Emoji: "&#x1F1F2&#x1F1F7",
                    Title: "Mauritania"
                }, {
                    Emoji: "&#x1F1F2&#x1F1F8",
                    Title: "Montserrat"
                }, {
                    Emoji: "&#x1F1F2&#x1F1F9",
                    Title: "Malta"
                }, {
                    Emoji: "&#x1F1F2&#x1F1FA",
                    Title: "Mauritius"
                }, {
                    Emoji: "&#x1F1F2&#x1F1FB",
                    Title: "Maldives"
                }, {
                    Emoji: "&#x1F1F2&#x1F1FC",
                    Title: "Malawi"
                }, {
                    Emoji: "&#x1F1F2&#x1F1FD",
                    Title: "Mexico"
                }, {
                    Emoji: "&#x1F1F2&#x1F1FE",
                    Title: "Malaysia"
                }, {
                    Emoji: "&#x1F1F2&#x1F1FF",
                    Title: "Mozambique"
                }, {
                    Emoji: "&#x1F1F3&#x1F1E6",
                    Title: "Namibia"
                }, {
                    Emoji: "&#x1F1F3&#x1F1E8",
                    Title: "New Caledonia"
                }, {
                    Emoji: "&#x1F1F3&#x1F1EA",
                    Title: "Niger"
                }, {
                    Emoji: "&#x1F1F3&#x1F1EB",
                    Title: "Norfolk Island"
                }, {
                    Emoji: "&#x1F1F3&#x1F1EC",
                    Title: "Nigeria"
                }, {
                    Emoji: "&#x1F1F3&#x1F1EE",
                    Title: "Nicaragua"
                }, {
                    Emoji: "&#x1F1F3&#x1F1F1",
                    Title: "Netherlands"
                }, {
                    Emoji: "&#x1F1F3&#x1F1F4",
                    Title: "Norway"
                }, {
                    Emoji: "&#x1F1F3&#x1F1F5",
                    Title: "Nepal"
                }, {
                    Emoji: "&#x1F1F3&#x1F1F7",
                    Title: "Nauru"
                }, {
                    Emoji: "&#x1F1F3&#x1F1FA",
                    Title: "Niue"
                }, {
                    Emoji: "&#x1F1F3&#x1F1FF",
                    Title: "New Zealand"
                }, {
                    Emoji: "&#x1F1F4&#x1F1F2",
                    Title: "Oman"
                }, {
                    Emoji: "&#x1F1F5&#x1F1E6",
                    Title: "Panama"
                }, {
                    Emoji: "&#x1F1F5&#x1F1EA",
                    Title: "Peru"
                }, {
                    Emoji: "&#x1F1F5&#x1F1EB",
                    Title: "French Polynesia"
                }, {
                    Emoji: "&#x1F1F5&#x1F1EC",
                    Title: "Papua New Guinea"
                }, {
                    Emoji: "&#x1F1F5&#x1F1ED",
                    Title: "Philippines"
                }, {
                    Emoji: "&#x1F1F5&#x1F1F0",
                    Title: "Pakistan"
                }, {
                    Emoji: "&#x1F1F5&#x1F1F1",
                    Title: "Poland"
                }, {
                    Emoji: "&#x1F1F5&#x1F1F2",
                    Title: "St. Pierre & Miquelon"
                }, {
                    Emoji: "&#x1F1F5&#x1F1F3",
                    Title: "Pitcairn Islands"
                }, {
                    Emoji: "&#x1F1F5&#x1F1F7",
                    Title: "Puerto Rico"
                }, {
                    Emoji: "&#x1F1F5&#x1F1F8",
                    Title: "Palestinian Territories"
                }, {
                    Emoji: "&#x1F1F5&#x1F1F9",
                    Title: "Portugal"
                }, {
                    Emoji: "&#x1F1F5&#x1F1FC",
                    Title: "Palau"
                }, {
                    Emoji: "&#x1F1F5&#x1F1FE",
                    Title: "Paraguay"
                }, {
                    Emoji: "&#x1F1F6&#x1F1E6",
                    Title: "Qatar"
                }, {
                    Emoji: "&#x1F1F7&#x1F1EA",
                    Title: "Réunion"
                }, {
                    Emoji: "&#x1F1F7&#x1F1F4",
                    Title: "Romania"
                }, {
                    Emoji: "&#x1F1F7&#x1F1F8",
                    Title: "Serbia"
                }, {
                    Emoji: "&#x1F1F7&#x1F1FA",
                    Title: "Russia"
                }, {
                    Emoji: "&#x1F1F7&#x1F1FC",
                    Title: "Rwanda"
                }, {
                    Emoji: "&#x1F1F8&#x1F1E6",
                    Title: "Saudi Arabia"
                }, {
                    Emoji: "&#x1F1F8&#x1F1E7",
                    Title: "Solomon Islands"
                }, {
                    Emoji: "&#x1F1F8&#x1F1E8",
                    Title: "Seychelles"
                }, {
                    Emoji: "&#x1F1F8&#x1F1E9",
                    Title: "Sudan"
                }, {
                    Emoji: "&#x1F1F8&#x1F1EA",
                    Title: "Sweden"
                }, {
                    Emoji: "&#x1F1F8&#x1F1EC",
                    Title: "Singapore"
                }, {
                    Emoji: "&#x1F1F8&#x1F1ED",
                    Title: "St. Helena"
                }, {
                    Emoji: "&#x1F1F8&#x1F1EE",
                    Title: "Slovenia"
                }, {
                    Emoji: "&#x1F1F8&#x1F1EF",
                    Title: "Svalbard & Jan Mayen"
                }, {
                    Emoji: "&#x1F1F8&#x1F1F0",
                    Title: "Slovakia"
                }, {
                    Emoji: "&#x1F1F8&#x1F1F1",
                    Title: "Sierra Leone"
                }, {
                    Emoji: "&#x1F1F8&#x1F1F2",
                    Title: "San Marino"
                }, {
                    Emoji: "&#x1F1F8&#x1F1F3",
                    Title: "Senegal"
                }, {
                    Emoji: "&#x1F1F8&#x1F1F4",
                    Title: "Somalia"
                }, {
                    Emoji: "&#x1F1F8&#x1F1F7",
                    Title: "Suriname"
                }, {
                    Emoji: "&#x1F1F8&#x1F1F8",
                    Title: "South Sudan"
                }, {
                    Emoji: "&#x1F1F8&#x1F1F9",
                    Title: "São Tomé & Príncipe"
                }, {
                    Emoji: "&#x1F1F8&#x1F1FB",
                    Title: "El Salvador"
                }, {
                    Emoji: "&#x1F1F8&#x1F1FD",
                    Title: "Sint Maarten"
                }, {
                    Emoji: "&#x1F1F8&#x1F1FE",
                    Title: "Syria"
                }, {
                    Emoji: "&#x1F1F8&#x1F1FF",
                    Title: "Swaziland"
                }, {
                    Emoji: "&#x1F1F9&#x1F1E6",
                    Title: "Tristan Da Cunha"
                }, {
                    Emoji: "&#x1F1F9&#x1F1E8",
                    Title: "Turks & Caicos Islands"
                }, {
                    Emoji: "&#x1F1F9&#x1F1E9",
                    Title: "Chad"
                }, {
                    Emoji: "&#x1F1F9&#x1F1EB",
                    Title: "French Southern Territories"
                }, {
                    Emoji: "&#x1F1F9&#x1F1EC",
                    Title: "Togo"
                }, {
                    Emoji: "&#x1F1F9&#x1F1ED",
                    Title: "Thailand"
                }, {
                    Emoji: "&#x1F1F9&#x1F1EF",
                    Title: "Tajikistan"
                }, {
                    Emoji: "&#x1F1F9&#x1F1F0",
                    Title: "Tokelau"
                }, {
                    Emoji: "&#x1F1F9&#x1F1F1",
                    Title: "Timor-Leste"
                }, {
                    Emoji: "&#x1F1F9&#x1F1F2",
                    Title: "Turkmenistan"
                }, {
                    Emoji: "&#x1F1F9&#x1F1F3",
                    Title: "Tunisia"
                }, {
                    Emoji: "&#x1F1F9&#x1F1F4",
                    Title: "Tonga"
                }, {
                    Emoji: "&#x1F1F9&#x1F1F7",
                    Title: "Turkey"
                }, {
                    Emoji: "&#x1F1F9&#x1F1F9",
                    Title: "Trinidad & Tobago"
                }, {
                    Emoji: "&#x1F1F9&#x1F1FB",
                    Title: "Tuvalu"
                }, {
                    Emoji: "&#x1F1F9&#x1F1FC",
                    Title: "Taiwan"
                }, {
                    Emoji: "&#x1F1F9&#x1F1FF",
                    Title: "Tanzania"
                }, {
                    Emoji: "&#x1F1FA&#x1F1E6",
                    Title: "Ukraine"
                }, {
                    Emoji: "&#x1F1FA&#x1F1EC",
                    Title: "Uganda"
                }, {
                    Emoji: "&#x1F1FA&#x1F1F2",
                    Title: "U.S. Outlying Islands"
                }, {
                    Emoji: "&#x1F1FA&#x1F1F3",
                    Title: "United Nations"
                }, {
                    Emoji: "&#x1F1FA&#x1F1F8",
                    Title: "United States"
                }, {
                    Emoji: "&#x1F1FA&#x1F1FE",
                    Title: "Uruguay"
                }, {
                    Emoji: "&#x1F1FA&#x1F1FF",
                    Title: "Uzbekistan"
                }, {
                    Emoji: "&#x1F1FB&#x1F1E6",
                    Title: "Vatican City"
                }, {
                    Emoji: "&#x1F1FB&#x1F1E8",
                    Title: "St. Vincent & Grenadines"
                }, {
                    Emoji: "&#x1F1FB&#x1F1EA",
                    Title: "Venezuela"
                }, {
                    Emoji: "&#x1F1FB&#x1F1EC",
                    Title: "British Virgin Islands"
                }, {
                    Emoji: "&#x1F1FB&#x1F1EE",
                    Title: "U.S. Virgin Islands"
                }, {
                    Emoji: "&#x1F1FB&#x1F1F3",
                    Title: "Vietnam"
                }, {
                    Emoji: "&#x1F1FB&#x1F1FA",
                    Title: "Vanuatu"
                }, {
                    Emoji: "&#x1F1FC&#x1F1EB",
                    Title: "Wallis & Futuna"
                }, {
                    Emoji: "&#x1F1FC&#x1F1F8",
                    Title: "Samoa"
                }, {
                    Emoji: "&#x1F1FD&#x1F1F0",
                    Title: "Kosovo"
                }, {
                    Emoji: "&#x1F1FE&#x1F1EA",
                    Title: "Yemen"
                }, {
                    Emoji: "&#x1F1FE&#x1F1F9",
                    Title: "Mayotte"
                }, {
                    Emoji: "&#x1F1FF&#x1F1E6",
                    Title: "South Africa"
                }, {
                    Emoji: "&#x1F1FF&#x1F1F2",
                    Title: "Zambia"
                }]
        };
        for (I = 0, N = CFH.Items.length; I < N; ++I) {
            addCFHItem(CFH.Items[I], CFH);
        }
        CFH.TextArea.addEventListener("paste", function (Event) {
            var Value;
            if (GM_getValue("CFH_ALIPF")) {
                Value = Event.clipboardData.getData("text/plain");
                if (Value.match(/^https?:/)) {
                    Event.preventDefault();
                    wrapCFHLinkImage(CFH, "", Value, Value.match(/\.(jpg|jpeg|gif|bmp|png)/) ? true : false);
                }
            }
        });
    }

    function wrapCFHLinkImage(CFH, Title, URL, Image) {
        var Start, End, Value;
        Start = CFH.TextArea.selectionStart;
        End = CFH.TextArea.selectionEnd;
        Value = (Image ? "!" : "") + "[" + Title + "](" + URL + ")";
        CFH.TextArea.value = CFH.TextArea.value.slice(0, Start) + Value + CFH.TextArea.value.slice(End);
        CFH.TextArea.setSelectionRange(End + Value.length, End + Value.length);
        CFH.TextArea.focus();
    }

    function insertCFHTableRows(N, Table) {
        while (N > 0) {
            insertCFHTableRow(Table);
            --N;
        }
    }

    function insertCFHTableRow(Table) {
        var N, Row, I, J, Delete;
        N = Table.rows.length;
        Row = Table.insertRow(N);
        for (I = 0, J = Table.rows[0].cells.length - 1; I < J; ++I) {
            Row.insertCell(0).innerHTML = "<input placeholder=\"Value\" type=\"text\"/>";
        }
        Delete = Row.insertCell(0);
        if (N > 2) {
            Delete.innerHTML =
                "<a>" +
                "    <i class=\"fa fa-times-circle\" title=\"Delete row\"></i>" +
                "</a>";
            Delete.firstElementChild.addEventListener("click", function () {
                if (Table.rows.length > 4) {
                    Row.remove();
                } else {
                    window.alert("A table must have a least one row and two columns.");
                }
            });
        }
    }

    function insertCFHTableColumns(N, Table) {
        while (N > 0) {
            insertCFHTableColumn(Table);
            --N;
        }
    }

    function insertCFHTableColumn(Table) {
        var Rows, N, I, J, Delete, Column;
        Rows = Table.rows;
        N = Rows[0].cells.length;
        for (I = 3, J = Rows.length; I < J; ++I) {
            Rows[I].insertCell(N).innerHTML = "<input placeholder=\"Value\" type=\"text\"/>";
        }
        Rows[2].insertCell(N).innerHTML =
            "<select>" +
            "    <option value=\":-\">Left</option>" +
            "    <option value=\":-:\">Center</option>" +
            "    <option value=\"-:\">Right</option>" +
            "</select>";
        Delete = Rows[0].insertCell(N);
        Delete.innerHTML =
            "<a>" +
            "    <i class=\"fa fa-times-circle\" title=\"Delete column\"></i>" +
            "</a>";
        Column = Rows[1].insertCell(N);
        Column.innerHTML = "<input placeholder=\"Header\" type=\"text\"/>";
        Delete.firstElementChild.addEventListener("click", function () {
            Rows = Table.rows;
            N = Rows[1].cells.length;
            if (N > 3) {
                do {
                    --N;
                } while (Rows[1].cells[N] != Column);
                for (I = 0, J = Rows.length; I < J; ++I) {
                    Rows[I].deleteCell(N);
                }
            } else {
                window.alert("A table must have at least one row and two columns.");
            }
        });
    }

    function setCFHEmojis(Emojis, CFH) {
        var I, N;
        for (I = 0, N = Emojis.children.length; I < N; ++I) {
            Emojis.children[I].addEventListener("click", function (Event) {
                wrapCFHFormat(CFH, Event.currentTarget.textContent);
            });
        }
    }

    function addCFHItem(Item, CFH) {
        var Context, Button, Popout;
        if ((Item.ID && GM_getValue(Item.ID)) || !Item.ID) {
            CFH.Panel.insertAdjacentHTML(
                "beforeEnd",
                "<span>" +
                "    <a class=\"page_heading_btn\" title=\"" + Item.Name + "\">" +
                "        <i class=\"fa " + Item.Icon + "\"></i>" + (Item.SecondaryIcon ? (
                    "    <i class=\"fa " + Item.SecondaryIcon + "\"></i>") : "") + (Item.Text ? (
                        "    <span>" + Item.Text + "</span") : "") +
                "    </a>" +
                "</span>"
            );
            Context = CFH.Panel.lastElementChild;
            Button = Context.firstElementChild;
            if (Item.setPopout) {
                Popout = createPopout(Context);
                Popout.Popout.classList.add("CFHPopout");
                Popout.customRule = function (Target) {
                    return !Button.contains(Target);
                };
                Item.setPopout(Popout.Popout);
                Button.addEventListener("click", function () {
                    if (Popout.Popout.classList.contains("rhHidden")) {
                        Popout.popOut(Button, Item.Callback);
                    } else {
                        Popout.Popout.classList.add("rhHidden");
                    }
                });
            } else if (Item.setPopup) {
                var popup = createPopup();
                popup.Icon.classList.add(`fa-table`);
                popup.Title.textContent = `Add a table:`;
                Item.setPopup(popup);
                Button.addEventListener("click", function () {
                    popup.popUp();
                });
            } else {
                if (Item.Callback) {
                    Item.Callback(Context);
                }
                Context.addEventListener("click", function () {
                    if (Item.OnClick) {
                        Item.OnClick();
                    } else {
                        wrapCFHFormat(CFH, Item.Prefix, Item.Suffix, Item.OrderedList, Item.UnorderedList);
                    }
                });
            }
        }
    }

    function wrapCFHFormat(CFH, Prefix, Suffix, OrderedList, UnorderedList) {
        var Value, Start, End, N;
        Value = CFH.TextArea.value;
        Start = CFH.TextArea.selectionStart;
        End = CFH.TextArea.selectionEnd;
        if (OrderedList || UnorderedList) {
            if (OrderedList) {
                N = 1;
                Prefix = N + ". " + Value.slice(Start, End).replace(/\n/g, function () {
                    return ("\n" + (++N) + ". ");
                });
            } else {
                Prefix = "* " + Value.slice(Start, End).replace(/\n/g, "\n* ");
            }
        }
        CFH.TextArea.value = Value.slice(0, Start) + Prefix + ((OrderedList || UnorderedList) ? "" : (Value.slice(Start, End) + (Suffix ? Suffix : ""))) + Value.slice(End);
        CFH.TextArea.setSelectionRange(End + Prefix.length, End + Prefix.length);
        CFH.TextArea.focus();
    }

    function setCFHALIPF(CFH, Value) {
        if (typeof Value == "undefined") {
            Value = GM_getValue("CFH_ALIPF") ? false : true;
            GM_setValue("CFH_ALIPF", Value);
        }
        if (Value) {
            CFH.ALIPF.title = "Automatic Links / Images Paste Formatting: On";
            CFH.ALIPF.classList.remove("CFHALIPF");
        } else {
            CFH.ALIPF.title = "Automatic Links / Images Paste Formatting: Off";
            CFH.ALIPF.classList.add("CFHALIPF");
        }
    }

    function loadReplyBoxOnTop() {
        var html = `
<div class="esgst-rbot"></div>
`;
        var sibling;
        if (esgst.mainPageHeadingBackground) {
            sibling = esgst.mainPageHeadingBackground;
        } else {
            sibling = esgst.mainPageHeading;
        }
        sibling.insertAdjacentHTML(`afterEnd`, html);
        var box = sibling.nextElementSibling;
        box.appendChild(esgst.replyBox);
        var button = box.getElementsByClassName(esgst.cancelButtonClass)[0];
        if (button) {
            button.addEventListener(`click`, waitToRestoreReplyBox);
        }

        function waitToRestoreReplyBox() {
            window.setTimeout(restoreReplyBox, 0);
        }

        function restoreReplyBox() {
            box.appendChild(esgst.replyBox);
        }
    }

    function loadReplyBoxPopup() {
        var Popup;
        var Context = esgst.mainPageHeading;
        Popup = createPopup();
        Popup.Popup.classList.add("rhPopupLarge");
        Popup.Icon.classList.add("fa-comment");
        Popup.Title.textContent = "Add a comment:";
        Popup.TextArea.classList.remove("rhHidden");
        if (esgst.cfh) {
            addCFHPanel(Popup.TextArea);
        }
        createButton(Popup.Button, "fa-check", "Save", "fa-circle-o-notch fa-spin", "Saving...", function (Callback) {
            Popup.Progress.innerHTML = "";
            saveComment(esgst.sg ? "" : document.querySelector("[name='trade_code']").value, "", Popup.TextArea.value, esgst.sg ? window.location.href.match(/(.+?)(#.+?)?$/)[1] : "/ajax.php", Popup.Progress,
                Callback);
        });
        Context.insertAdjacentHTML(
            "afterBegin",
            "<a class=\"page_heading_btn MCBPButton\" title=\"Add a comment\">" +
            "    <i class=\"fa fa-comment\"></i>" +
            "</a>"
        );
        Context.firstElementChild.addEventListener("click", function () {
            Popup.popUp(function () {
                Popup.TextArea.focus();
            });
        });
    }

    function loadMultiReply(context) {
        var matches = context.getElementsByClassName(esgst.sg ? `comment__actions` : `action_list`);
        for (var i = 0, n = matches.length; i < n; ++i) {
            addMRButton(matches[i]);
        }
    }

    function addMRButton(Context) {
        var MR, Parent, ReplyButton, Permalink;
        MR = {
            Context: Context,
            Comment: Context.closest(esgst.sg ? ".comment" : ".comment_outer")
        };
        if (MR.Comment) {
            Parent = MR.Comment.closest(esgst.sg ? ".comment" : ".comment_outer");
            MR.Container = MR.Comment.getElementsByClassName(esgst.sg ? "comment__summary" : "comment_inner")[0];
            MR.Timestamp = MR.Context.firstElementChild;
            ReplyButton = MR.Context.getElementsByClassName(esgst.sg ? "js__comment-reply" : "js_comment_reply")[0];
            Permalink = MR.Context.lastElementChild;
            if (ReplyButton || window.location.pathname.match(/^\/messages/)) {
                if (ReplyButton) {
                    ReplyButton.remove();
                    MR.ParentID = Parent.getAttribute(esgst.sg ? "data-comment-id" : "data-id");
                    if (window.location.pathname.match(/^\/messages/)) {
                        MR.URL = Permalink.getAttribute("href");
                    }
                } else {
                    MR.URL = Permalink.getAttribute("href");
                    MR.Comment.insertAdjacentHTML("beforeEnd", "<div class=\"comment__children comment_children\"></div>");
                }
                if (esgst.sg) {
                    MR.TradeCode = "";
                } else {
                    if (!window.location.pathname.match(/^\/messages/)) {
                        MR.TradeCode = window.location.pathname.match(/^\/trade\/(.+?)\//)[1];
                    }
                    MR.Username = MR.Comment.getElementsByClassName("author_name")[0].textContent;
                }
                MR.Timestamp.insertAdjacentHTML("afterEnd", "<a class=\"comment__actions__button MRReply\">Reply</a>");
                MR.Timestamp.nextElementSibling.addEventListener("click", function () {
                    if (!MR.Box) {
                        addMRBox(MR);
                    } else {
                        MR.Description.focus();
                    }
                });
            }
            MR.Children = MR.Comment.getElementsByClassName(esgst.sg ? "comment__children" : "comment_children")[0];
            setMREdit(MR);
        }
    }

    function addMRBox(MR) {
        var Username;
        Username = GM_getValue("Username");
        MR.Children.insertAdjacentHTML(
            "afterBegin",
            "<div class=\"comment reply_form MRBox\">" + (esgst.sg ? (
                "<div class=\"comment__child\">" +
                "    <a href=\"/user/" + Username + "\" class=\"global__image-outer-wrap global__image-outer-wrap--avatar-small\">" +
                "        <div class=\"global__image-inner-wrap\" style=\"background-image: url(" + GM_getValue("Avatar") + ");\"></div>" +
                "    </a>" +
                "    <div class=\"comment__summary\">" +
                "        <div class=\"comment__author\">" +
                "            <div class=\"comment__username\">" +
                "                <a href=\"/user/" + Username + "\">" + Username + "</a>" +
                "            </div>" +
                "        </div>" +
                "        <div class=\"comment__display-state\">" +
                "            <div class=\"comment__description\">") : "") +
            "                    <input name=\"trade_code\" type=\"hidden\" value=\"" + MR.TradeCode + "\">" +
            "                    <input name=\"parent_id\" type=\"hidden\" value=\"" + MR.ParentID + "\">" +
            "                    <textarea class=\"MRDescription\" name=\"description\"" + (esgst.sg ? "" : " placeholder=\"Write a reply to " + MR.Username + "...\"") + "></textarea>" +
            "                    <div class=\"align-button-container btn_actions\">" +
            "                        <div></div>" +
            "                        <div class=\"comment__cancel-button btn_cancel MRCancel\">" +
            "                            <span>Cancel</span>" +
            "                        </div>" +
            "                    </div>" + (esgst.sg ? (
                "            </div>" +
                "        </div>" +
                "    </div>" +
                "</div>") : "") +
            "</div>"
        );
        MR.Box = MR.Children.firstElementChild;
        MR.Description = MR.Box.getElementsByClassName("MRDescription")[0];
        MR.Cancel = MR.Box.getElementsByClassName("MRCancel")[0];
        if (esgst.cfh) {
            addCFHPanel(MR.Description);
        }
        MR.Description.focus();
        addDEDButton(MR.Box, MR.URL, function (Response, DEDStatus) {
            var ReplyID, Reply, ResponseJSON;
            if (esgst.sg) {
                ReplyID = Response.finalUrl.match(/#(.+)/);
                if (ReplyID) {
                    MR.Box.remove();
                    Reply = DOM.parse(Response.responseText).getElementById(ReplyID[1]).closest(".comment");
                    addRMLLink(MR.Container, [Reply]);
                    loadEndlessFeatures(Reply);
                    MR.Children.appendChild(Reply);
                    window.location.hash = ReplyID[1];
                } else {
                    DEDStatus.innerHTML =
                        "<i class=\"fa fa-times\"></i> " +
                        "<span>Failed!</span>";
                }
            } else {
                ResponseJSON = JSON.parse(Response.responseText);
                if (ResponseJSON.success) {
                    MR.Box.remove();
                    Reply = DOM.parse(ResponseJSON.html).getElementsByClassName("comment_outer")[0];
                    addRMLLink(MR.Container, [Reply]);
                    loadEndlessFeatures(Reply);
                    MR.Children.appendChild(Reply);
                    window.location.hash = Reply.id;
                } else {
                    DEDStatus.innerHTML =
                        "<i class=\"fa fa-times\"></i> " +
                        "<span>Failed!</span>";
                }
            }
        });
        MR.Cancel.addEventListener("click", function () {
            MR.Box.remove();
            MR.Box = null;
        });
    }

    function setMREdit(MR) {
        var DisplayState, EditState, EditSave, ID, AllowReplies, Description;
        MR.Edit = MR.Context.getElementsByClassName(esgst.sg ? "js__comment-edit" : "js_comment_edit")[0];
        if (MR.Edit) {
            MR.Edit.insertAdjacentHTML("afterEnd", "<a class=\"comment__actions__button MREdit\">Edit</a>");
            MR.Edit = MR.Edit.nextElementSibling;
            MR.Edit.previousElementSibling.remove();
            DisplayState = MR.Comment.getElementsByClassName(esgst.sg ? "comment__display-state" : "comment_body_default")[0];
            EditState = MR.Comment.getElementsByClassName(esgst.sg ? "comment__edit-state" : "edit_form")[0];
            EditSave = EditState.getElementsByClassName(esgst.sg ? "js__comment-edit-save" : "js_submit")[0];
            EditSave.insertAdjacentHTML(
                "afterEnd",
                "<a class=\"comment__submit-button btn_action white EditSave\">" +
                "    <i class=\"fa fa-edit\"></i>" +
                "    <span>Edit</span>" +
                "</a>"
            );
            EditSave = EditSave.nextElementSibling;
            EditSave.previousElementSibling.remove();
            ID = EditState.querySelector("[name='comment_id']").value;
            AllowReplies = esgst.sg ? EditState.querySelector("[name='allow_replies']").value : "";
            Description = EditState.querySelector("[name='description']");
            MR.Edit.addEventListener("click", function () {
                var Temp;
                if (esgst.sg) {
                    DisplayState.classList.add("is-hidden");
                    MR.Context.classList.add("is-hidden");
                } else {
                    MR.Container.classList.add("is_hidden");
                }
                EditState.classList.remove(esgst.sg ? "is-hidden" : "is_hidden");
                Temp = Description.value;
                Description.focus();
                Description.value = "";
                Description.value = Temp;
            });
            EditSave.addEventListener("click", function () {
                makeRequest("xsrf_token=" + esgst.xsrfToken + "&do=comment_edit&comment_id=" + ID + "&allow_replies=" + AllowReplies + "&description=" + encodeURIComponent(Description.value),
                    "/ajax.php", null, function (Response) {
                        var ResponseJSON, ResponseHTML;
                        ResponseJSON = JSON.parse(Response.responseText);
                        if (ResponseJSON.type == "success" || ResponseJSON.success) {
                            ResponseHTML = DOM.parse(ResponseJSON[esgst.sg ? "comment" : "html"]);
                            DisplayState.innerHTML = ResponseHTML.getElementsByClassName(esgst.sg ? "comment__display-state" : "comment_body_default")[0].innerHTML;
                            EditState.classList.add(esgst.sg ? "is-hidden" : "is_hidden");
                            MR.Timestamp.innerHTML = ResponseHTML.getElementsByClassName(esgst.sg ? "comment__actions" : "action_list")[0].firstElementChild.innerHTML;
                            if (esgst.at) {
                                getTimestamps(MR.Timestamp);
                            }
                            if (esgst.sg) {
                                DisplayState.classList.remove("is-hidden");
                                MR.Context.classList.remove("is-hidden");
                            } else {
                                MR.Container.classList.remove("is_hidden");
                            }
                        }
                    });
            });
        }
    }

    /* Avatar Popout */

    function loadAp() {
        if (esgst.sg) {
            esgst.endlessFeatures.push(getApAvatars);
            getApAvatars(document);
        }
    }

    function getApAvatars(context) {
        var i, matches, n;
        matches = context.getElementsByClassName(`global__image-outer-wrap--avatar-small`);
        for (i = 0, n = matches.length; i < n; ++i) {
            setApAvatar(matches[i]);
        }
    }

    function setApAvatar(apAvatar) {
        var id, match, type, url;
        url = apAvatar.getAttribute(`href`);
        if (url) {
            match = url.match(/\/(user|group)\/(.+)/);
            if (match) {
                id = match[2];
                type = match[1];
                apAvatar.classList.add(`esgst-ap-avatar`);
                apAvatar.removeAttribute(`href`);
                apAvatar.addEventListener(`click`, function() {
                    var popout;
                    popout = esgst.apPopouts[id];
                    if (popout) {
                        popout.open(apAvatar);
                    } else {
                        esgst.apPopouts[id] = popout = createPopout_v6(`page__outer-wrap esgst-ap-popout`);
                        popout.popout.innerHTML = `
                            <i class="fa fa-circle-o-notch fa-spin"></i>
                            <span>Loading ${type}...</span>
                        `;
                        popout.open(apAvatar);
                        request(null, false, url, function (response) {
                            var avatar, columns, i, link, n, reportButton, responseHtml, table;
                            responseHtml = DOM.parse(response.responseText);
                            popout.popout.innerHTML = ``;
                            popout.popout.appendChild(responseHtml.getElementsByClassName(`featured__outer-wrap`)[0]);
                            avatar = popout.popout.getElementsByClassName(`global__image-outer-wrap--avatar-large`)[0];
                            link = insertHtml(avatar, `afterEnd`, `<a class="esgst-ap-link"></a>`);
                            link.appendChild(avatar);
                            link.setAttribute(`href`, url);
                            table = popout.popout.getElementsByClassName(`featured__table`)[0];
                            table.parentElement.insertBefore(responseHtml.getElementsByClassName(`sidebar__shortcut-inner-wrap`)[0], table);
                            reportButton = popout.popout.getElementsByClassName(`js__submit-form-inner`)[0];
                            if (reportButton) {
                                reportButton.addEventListener(`click`, function() {
                                    return reportButton.getElementsByTagName(`form`)[0].submit();
                                });
                            }
                            columns = table.children;
                            for (i = 0, n = columns[1].children.length; i < n; ++i) {
                                columns[0].appendChild(columns[1].firstElementChild);
                            }
                            columns[1].remove();
                            if (type === `user`) {
                                loadProfileFeatures(popout.popout);
                            }
                            popout.reposition();
                        });
                    }
                });
            }
        }
    }

    /* */

    function loadProfileFeatures(Context) {
        var Heading, SteamButton, User;
        Heading = Context.getElementsByClassName(esgst.sg ? "featured__heading" : "page_heading")[0];
        SteamButton = Context.querySelector("a[href*='/profiles/']");
        User = {};
        User.ID = Context.querySelector("[name='child_user_id']");
        User.ID = User.ID ? User.ID.value : "";
        User.SteamID64 = SteamButton.getAttribute("href").match(/\d+/)[0];
        User.Username = esgst.sg ? Heading.textContent : "";
        var pf = {
            context: Context,
            heading: Heading,
            steamButton: SteamButton
        };
        var Matches = Context.getElementsByClassName("featured__table__row__left");
        for (var I = 0, N = Matches.length; I < N; ++I) {
            var Match = Matches[I].textContent.match(/(Gifts (Won|Sent)|Contributor Level)/);
            if (Match) {
                var Key = Match[2];
                if (Key) {
                    if (Key == "Won") {
                        pf.wonRow = Matches[I];
                    } else {
                        pf.sentRow = Matches[I];
                    }
                } else {
                    pf.contributorLevelRow = Matches[I];
                }
            }
        }
        for (var i = 0, n = esgst.profileFeatures.length; i < n; ++i) {
            esgst.profileFeatures[i](pf, User);
        }
    }

    /* Username History */

    function loadUsernameHistory(context, user) {
        if (context == document) {
            context = esgst.featuredHeading;
            user = esgst.user;
        } else {
            context = context.heading;
        }
        if (context) {
            var html = `
<div class="esgst-uh-container">
<a class="esgst-uh-button">
<i class="fa fa-caret-down"></i>
</a>
<div class="featured__outer-wrap esgst-uh-box esgst-hidden">
<div class="featured__table__row__left esgst-uh-title">
<span>Username History</span>
<a href="https://goo.gl/C2wjUh" title="Expand the database">
<i class="fa fa-expand"></i>
</a>
</div>
<ul class="featured__table__row__right esgst-uh-list"></ul>
</div>
</div>
`;
            context.insertAdjacentHTML(`beforeEnd`, html);
            esgst.uh = {
                user: user,
                loaded: false
            };
            esgst.uh.container = context.lastElementChild;
            esgst.uh.button = esgst.uh.container.firstElementChild;
            esgst.uh.box = esgst.uh.button.nextElementSibling;
            esgst.uh.list = esgst.uh.box.lastElementChild;
            esgst.uh.button.addEventListener(`click`, toggleUhBox);
            document.addEventListener(`click`, closeUhBox);
        }
    }

    function toggleUhBox() {
        esgst.uh.box.classList.toggle(`esgst-hidden`);
        if (!esgst.uh.loaded) {
            getUhUsernames();
        }
    }

    function getUhUsernames() {
        esgst.uh.list.innerHTML = `
<i class="fa fa-circle-o-notch fa-spin"></i>
<span>Loading usernames...</span>
`;
        var url = `https://script.google.com/macros/s/AKfycbzvOuHG913mRIXOsqHIeAuQUkLYyxTHOZim5n8iP-k80iza6g0/exec?Action=1&SteamID64=${esgst.uh.user.SteamID64}&Username=${esgst.uh.user.Username}`;
        makeRequest(null, url, esgst.uh.list, loadUhUsernames);
    }

    function loadUhUsernames(response) {
        esgst.uh.loaded = true;
        esgst.uh.list.innerHTML = `<li>${JSON.parse(response.responseText).Usernames.join(`</li><li>`)}</li>`;
    }

    function closeUhBox(event) {
        if (!esgst.uh.box.classList.contains(`esgst-hidden`) && !esgst.uh.container.contains(event.target)) {
            esgst.uh.box.classList.add(`esgst-hidden`);
        }
    }

    /* User Notes */

    function loadUserNotes(mainContext, user) {
        var context;
        if (mainContext == document) {
            context = esgst.featuredHeading;
            user = esgst.user;
        } else {
            context = mainContext.heading;
            mainContext = mainContext.context;
        }
        if (context) {
            var position, userId;
            if (esgst.sg) {
                position = `beforeEnd`;
                userId = `Username`;
            } else {
                position = `afterBegin`;
                userId = `SteamID64`;
            }
            var html = `
<a class="page_heading_btn esgst-un-button" title="Add user notes">
<i class="fa"></i>
</a>
`;
            userId = user[userId];
            esgst.un = {
                user: user,
                userId: userId
            };
            esgst.un.button = insertHtml(context, position, html);
            esgst.un.icon = esgst.un.button.firstElementChild;
            user = JSON.parse(GM_getValue(`users`)).users[user.SteamID64];
            if (user && user.notes) {
                esgst.un.icon.classList.add(`fa-sticky-note`);
            } else {
                esgst.un.icon.classList.add(`fa-sticky-note-o`);
            }
            esgst.un.button.addEventListener(`click`, openUnPopup);
            if (esgst.sg && esgst.un_wb) {
                var sidebar = mainContext.getElementsByClassName(`sidebar__shortcut-inner-wrap`)[0];
                if (sidebar) {
                    var whitelistButton = sidebar.getElementsByClassName(`sidebar__shortcut__whitelist`)[0];
                    if (whitelistButton) {
                        whitelistButton.addEventListener(`click`, openUnPopup);
                    }
                    var blacklistButton = sidebar.getElementsByClassName(`sidebar__shortcut__blacklist`)[0];
                    if (blacklistButton) {
                        blacklistButton.addEventListener(`click`, openUnPopup);
                    }
                }
            }
        }
    }

    function openUnPopup() {
        esgst.un.popup = createPopup(true);
        esgst.un.popup.Icon.classList.add(`fa-sticky-note`);
        esgst.un.popup.Title.innerHTML = `Edit user notes for <span>${esgst.un.userId}</span>:`;
        esgst.un.popup.TextArea.classList.remove(`rhHidden`);
        createButton(esgst.un.popup.Button, `fa-check`, `Save`, `fa-circle-o-notch fa-spin`, `Saving...`, saveNotes);
        esgst.un.popup.popUp(function () {
            esgst.un.popup.TextArea.focus();
            var user = JSON.parse(GM_getValue(`users`)).users[esgst.un.user.SteamID64];
            if (user && user.notes) {
                esgst.un.popup.TextArea.value = user.notes;
            }
        });
    }

    function saveNotes(callback) {
        var notes = esgst.un.popup.TextArea.value.trim();
        var steamId = esgst.un.user.SteamID64;
        var username = esgst.un.user.Username;
        var id = esgst.un.user.ID;
                createLock(`userLock`, 300, function (deleteLock) {
                    var users;
                    users = JSON.parse(GM_getValue(`users`));
                    getSteamId(steamId, id, username, users, function(steamId) {
                        users.users[steamId].notes = notes;
                        GM_setValue(`users`, JSON.stringify(users));
                        deleteLock();
                        callback();
                        esgst.un.popup.Close.click();
                        if (notes) {
                            esgst.un.icon.classList.remove(`fa-sticky-note-o`);
                            esgst.un.icon.classList.add(`fa-sticky-note`);
                        } else {
                            esgst.un.icon.classList.remove(`fa-sticky-note`);
                            esgst.un.icon.classList.add(`fa-sticky-note-o`);
                        }
                    });
                });
    }

    /* */

    function insertHtml(context, position, html) {
        context.insertAdjacentHTML(position, html);
        var positions = {
            beforeBegin: `previousElementSibling`,
            afterBegin: `firstElementChild`,
            beforeEnd: `lastElementChild`,
            afterEnd: `nextElementSibling`
        };
        return context[positions[position]];
    }

    /* User Tags */

    function loadUserTags() {
        var key, i, n, steamId, user, username, users;
        users = JSON.parse(GM_getValue(`users`));
        for (key in esgst.currentUsers) {
            steamId = esgst.sg ? users.steamIds[key] : key;
            username = esgst.sg ? key : users.users[key] && users.users[key].username;
            for (i = 0, n = esgst.currentUsers[key].length; i < n; ++i) {
                addPUTButton(esgst.currentUsers[key][i], steamId, username, key);
            }
            user = esgst.sg ? steamId && users.users[steamId] : users.users[key];
            if (user && user.tags) {
                addPUTTags(key, user.tags);
            }
        }
    }

    function addPUTButton(Context, steamId, username, key) {
        var Container;
        Container = Context.parentElement;
        if (Container.classList.contains("comment__username")) {
            Context = Container;
        }
        Context.insertAdjacentHTML(
            "afterEnd",
            "<a class=\"PUTButton\">" +
            "    <i class=\"fa fa-tag\"></i>" +
            "    <span class=\"PUTTags\"></span>" +
            "</a>"
        );
        Context.nextElementSibling.addEventListener("click", function () {
            var Popup;
            Popup = createPopup(true);
            Popup.Icon.classList.add("fa-tag");
            Popup.Title.innerHTML = "Edit user tags for <span>" + key + "</span>:";
            Popup.TextInput.classList.remove("rhHidden");
            Popup.TextInput.addEventListener(`keydown`, function(e) {
                if (e.key === `Enter`) {
                    Popup.Button.firstElementChild.click();
                }
            });
            Popup.TextInput.insertAdjacentHTML("afterEnd", createDescription("Use commas to separate tags, for example: Tag1, Tag2, ..."));
            createButton(Popup.Button, "fa-check", "Save", "fa-circle-o-notch fa-spin", "Saving...", function (Callback) {
                var tags;
                tags = Popup.TextInput.value.replace(/(,\s*)+/g, function (Match, P1, Offset, String) {
                    return (((Offset === 0) || (Offset == (String.length - Match.length))) ? "" : ", ");
                }).split(`, `);
                createLock(`userLock`, 300, function (deleteLock) {
                    var users;
                    users = JSON.parse(GM_getValue(`users`));
                    getSteamId(steamId, null, username, users, function(steamId, change) {
                        if (change) {
                            if (!users.users[steamId].tags) {
                                users.users[steamId].tags = [];
                            }
                            for (var i = 0, n = tags.length; i < n; ++i) {
                                if (users.users[steamId].tags.indexOf(tags[i]) < 0) {
                                    users.users[steamId].tags.push(tags[i]);
                                }
                            }
                        } else {
                            users.users[steamId].tags = tags;
                        }
                        GM_setValue(`users`, JSON.stringify(users));
                        deleteLock();
                        addPUTTags(key, tags);
                        Callback();
                        Popup.Close.click();
                    });
                });
            });
            Popup.popUp(function () {
                var user, users;
                users = JSON.parse(GM_getValue(`users`));
                user = steamId && users.users[steamId];
                Popup.TextInput.focus();
                if (user && user.tags) {
                    Popup.TextInput.value = user.tags;
                }
            });
        });
    }

    function addPUTTags(UserID, Tags) {
        var Matches, Prefix, Suffix, HTML, I, N, Context, Container;
        Matches = esgst.users[UserID];
        Prefix = "<span class=\"global__image-outer-wrap author_avatar is_icon\">";
        Suffix = "</span>";
        if (Tags.length) {
            HTML = Prefix;
            HTML += Tags.join(Suffix + Prefix);
            HTML += Suffix;
        } else {
            HTML = ``;
        }
        for (I = 0, N = Matches.length; I < N; ++I) {
            Context = Matches[I];
            Container = Context.parentElement;
            if (Container) {
                if (Container.classList.contains("comment__username")) {
                    Context = Container;
                }
                Context.parentElement.getElementsByClassName("PUTTags")[0].innerHTML = HTML;
            }
        }
    }

    /* Real Won/Sent CV Links */

    function loadRealWonSentCVLinks(context, user) {
        var wonRow, sentRow;
        if (context.context) {
            wonRow = context.wonRow;
            sentRow = context.sentRow;
        } else {
            wonRow = esgst.wonRow;
            sentRow = esgst.sentRow;
            user = esgst.user;
        }
        if (wonRow && sentRow) {
            addRWSCVLLink(wonRow, `Won`, user);
            addRWSCVLLink(sentRow, `Sent`, user);
            if (esgst.rwscvl_al) {
                getRwscvlData(wonRow, sentRow, user);
            }
        }
    }

    function addRWSCVLLink(Context, Key, User) {
        var URL;
        URL = "http://www.sgtools.info/" + Key.toLowerCase() + "/" + User.Username;
        Context.innerHTML = "<a class=\"RWSCVLLink\" href=\"" + URL + (esgst.rwscvl_ro ? "/newestfirst" : "") +
            "\" target=\"_blank\">Gifts " + Key + "</a>";
    }

    function getRwscvlData(WonContext, SentContext, User) {
        var RWSCVL = {
            WonProgress: insertHtml(WonContext.nextElementSibling, `beforeEnd`, `
                <span>
                    <i class="fa fa-circle-o-notch fa-spin"></i>
                </span>
            `),
            SentProgress: insertHtml(SentContext.nextElementSibling.firstElementChild, `beforeEnd`, `
                <span>
                    <i class="fa fa-circle-o-notch fa-spin"></i>
                </span>
            `)
        };
        createLock(`userLock`, 300, function(deleteLock) {
            var users = JSON.parse(GM_getValue(`users`));
            getSteamId(User.SteamID64, User.ID, User.Username, users, function(steamId) {
                GM_setValue(`users`, JSON.stringify(users));
                deleteLock();
                var rwscvl = users.users[steamId].rwscvl;
                if (!rwscvl) {
                    rwscvl = {
                        won: 0,
                        sent: 0,
                        lastCheck: 0
                    };
                }
                if (Date.now() - rwscvl.lastCheck > 604800000) {
                    request(null, true, "http://www.sgtools.info/won/" + User.Username, function (Response) {
                        var won;
                        won = DOM.parse(Response.responseText).getElementById("data").textContent.replace(/\s\$/, "");
                        request(null, true, "http://www.sgtools.info/sent/" + User.Username, function (Response) {
                            var sent;
                            sent = DOM.parse(Response.responseText).getElementById("data").textContent.replace(/\s\$/, "");
                            rwscvl.won = won;
                            rwscvl.sent = sent;
                            rwscvl.lastCheck = Date.now();
                            createLock(`userLock`, 300, function(deleteLock) {
                                users = JSON.parse(GM_getValue(`users`));
                                users.users[steamId].rwscvl = rwscvl;
                                GM_setValue(`users`, JSON.stringify(users));
                                deleteLock();
                                RWSCVL.WonProgress.innerHTML = `(\$${won} Real CV)`;
                                RWSCVL.SentProgress.innerHTML = `(\$${sent} Real CV)`;
                            });
                        });
                    });
                } else {
                    RWSCVL.WonProgress.innerHTML = `(\$${rwscvl.won} Real CV)`;
                    RWSCVL.SentProgress.innerHTML = `(\$${rwscvl.sent} Real CV)`;
                }
            });
        });
    }

    /* User Giveaways Data */

    function loadUserGiveawaysData(context, user) {
        var wonRow, sentRow;
        if (context.context) {
            wonRow = context.wonRow;
            sentRow = context.sentRow;
        } else {
            wonRow = esgst.wonRow;
            sentRow = esgst.sentRow;
            user = esgst.user;
        }
        if (wonRow && sentRow) {
            addUGDButton(wonRow, `won`, user);
            addUGDButton(sentRow, `sent`, user);
        }
    }

    function addUGDButton(Context, Key, User) {
        var UGD, UGDButton, Popup;
        UGD = {
            Key: Key
        };
        Context.insertAdjacentHTML(
            "beforeEnd",
            " <span class=\"UGDButton\" title=\"Get " + UGD.Key + " giveaways data\">" +
            "    <i class=\"fa fa-bar-chart\"></i>" +
            "</span>"
        );
        UGDButton = Context.lastElementChild;
        Popup = createPopup();
        Popup.Popup.classList.add("rhPopupLarge");
        Popup.Icon.classList.add("fa-bar-chart");
        Popup.Title.textContent = "Get " + User.Username + "'s " + UGD.Key + " giveaways data:";
        createOptions(Popup.Options, UGD, [{
            Check: function () {
                return true;
            },
            Description: "Clear cache.",
            Title: "If enabled, the cache will be cleared and all giveaways will be retrieved again (slower).",
            Name: "ClearCache",
            Key: "CC",
            ID: "UGD_CC"
        }]);
        createButton(Popup.Button, "fa-bar-chart", "Get Data", "fa-times-circle", "Cancel", function (Callback) {
            UGD.Canceled = false;
            UGDButton.classList.add("rhBusy");
            createLock(`userLock`, 300, function(deleteLock) {
                var users = JSON.parse(GM_getValue(`users`));
                getSteamId(User.SteamID64, User.ID, User.Username, users, function(steamId) {
                    var Match, CurrentPage;
                    GM_setValue(`users`, JSON.stringify(users));
                    deleteLock();
                    var ugd = users.users[steamId].ugd;
                    var username = users.users[steamId].username;
                    if (UGD.CC.checked) {
                        ugd[UGD.Key] = null;
                    }
                    if (!ugd) {
                        ugd = {
                            sent: {
                                apps: {},
                                subs: {}
                            },
                            won: {
                                apps: {},
                                subs: {}
                            },
                            sentTimestamp: 0,
                            wonTimestamp: 0
                        };
                    } else {
                        if (!ugd.sent) {
                            ugd.sent = {
                                apps: {},
                                subs: {}
                            };
                            ugd.sentTimestamp = 0;
                        }
                        if (!ugd.won) {
                            ugd.won = {
                                apps: {},
                                subs: {}
                            };
                            ugd.wonTimestamp = 0;
                        }
                    }
                    Match = window.location.pathname.match(new RegExp("^\/user\/" + username + ((UGD.Key == "won") ? "/giveaways/won" : "")));
                    CurrentPage = window.location.href.match(/page=(\d+)/);
                    CurrentPage = Match ? (CurrentPage ? parseInt(CurrentPage[1]) : 1) : 0;
                    getUGDGiveaways(UGD, ugd, 1, CurrentPage, Match, "/user/" + username + ((UGD.Key == "won") ? "/giveaways/won" : "") + "/search?page=", function (ugd) {
                        createLock(`userLock`, 300, function(deleteLock) {
                            var Giveaways, Types, TypesTotal, Frequencies, Total, LevelsTotal;
                            users = JSON.parse(GM_getValue(`users`));
                            users.users[steamId].ugd = ugd;
                            GM_setValue(`users`, JSON.stringify(users));
                            deleteLock();
                            UGDButton.classList.remove("rhBusy");
                            Giveaways = ugd[UGD.Key];
                                Types = {
                                    Everyone: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    Invite: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    Group: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    Whitelist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    Group_Whitelist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    Region: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    Region_Invite: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    Region_Group: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    Region_Whitelist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    Region_Group_Whitelist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                                };
                                TypesTotal = {
                                    Everyone: 0,
                                    Invite: 0,
                                    Group: 0,
                                    Whitelist: 0,
                                    Group_Whitelist: 0,
                                    Region: 0,
                                    Region_Invite: 0,
                                    Region_Group: 0,
                                    Region_Whitelist: 0,
                                    Region_Group_Whitelist: 0
                                };
                                LevelsTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                                Total = 0;
                                Frequencies = {};
                            countUgdGiveaways(Frequencies, Giveaways.apps, LevelsTotal, Total, UGD.Key === `won` ? `creators` : `apps`, Types, TypesTotal, UGD, function(LevelsTotal, Total) {
                                countUgdGiveaways(Frequencies, Giveaways.subs, LevelsTotal, Total, UGD.Key === `won` ? `creators` : `subs`, Types, TypesTotal, UGD, function(LevelsTotal, Total) {
                                    var HTML, Type, I, N, Value, Ordered;
                                    HTML =
                                    "<table class=\"UGDData\">" +
                                    "    <tr>" +
                                    "        <th>Type</th>" +
                                    "        <th>Level 0</th>" +
                                    "        <th>Level 1</th>" +
                                    "        <th>Level 2</th>" +
                                    "        <th>Level 3</th>" +
                                    "        <th>Level 4</th>" +
                                    "        <th>Level 5</th>" +
                                    "        <th>Level 6</th>" +
                                    "        <th>Level 7</th>" +
                                    "        <th>Level 8</th>" +
                                    "        <th>Level 9</th>" +
                                    "        <th>Level 10</th>" +
                                    "        <th>Total</th>" +
                                    "    </tr>";
                                for (Type in Types) {
                                    HTML +=
                                        "<tr>" +
                                        "    <td>" + Type.replace(/_/g, " + ") + "</td>";
                                    for (I = 0; I <= 10; ++I) {
                                        Value = Types[Type][I];
                                        HTML +=
                                            "<td" + (Value ? "" : " class=\"is-faded\"") + ">" + Value + "</td>";
                                    }
                                    Value = Math.round(TypesTotal[Type] / Total * 10000) / 100;
                                    HTML +=
                                        "    <td" + (Value ? "" : " class=\"is-faded\"") + ">" + TypesTotal[Type] + " (" + Value + "%)</td>" +
                                        "</tr>";
                                }
                                HTML +=
                                    "    <tr>" +
                                    "        <td>Total</td>";
                                for (I = 0; I <= 10; ++I) {
                                    Value = Math.round(LevelsTotal[I] / Total * 10000) / 100;
                                    HTML +=
                                        "    <td" + (Value ? "" : " class=\"is-faded\"") + ">" + LevelsTotal[I] + " (" + Value + "%)</td>";
                                }
                                HTML +=
                                    "        <td" + (Total ? "" : " class=\"is-faded\"") + ">" + Total + "</td>" +
                                    "    </tr>" +
                                    "</table>";
                                Ordered = [];
                                for (Key in Frequencies.apps) {
                                    for (I = 0, N = Ordered.length; (I < N) && (Frequencies.apps[Key].frequency <= Ordered[I].frequency); ++I);
                                    Ordered.splice(I, 0, Frequencies.apps[Key]);
                                }
                                for (Key in Frequencies.subs) {
                                    for (I = 0, N = Ordered.length; (I < N) && (Frequencies.subs[Key].frequency <= Ordered[I].frequency); ++I);
                                    Ordered.splice(I, 0, Frequencies.subs[Key]);
                                }
                                for (Key in Frequencies.creators) {
                                    for (I = 0, N = Ordered.length; (I < N) && (Frequencies.creators[Key].frequency <= Ordered[I].frequency); ++I);
                                    Ordered.splice(I, 0, Frequencies.creators[Key]);
                                }
                                HTML +=
                                    "<div class=\"rhBold\">" + ((UGD.Key == "sent") ? "Most given away:" : "Most won from:") + "</div>" +
                                    "<ul>";
                                for (Key in Ordered) {
                                    HTML +=
                                        "<li>" + Ordered[Key].name + " - <span class=\"rhBold\">" + Ordered[Key].frequency + "</span></li>";
                                }
                                HTML +=
                                    "</ul>";
                                Popup.Results.innerHTML = HTML;
                                UGD.Progress.innerHTML = ``;
                                UGD.Popup.reposition();
                                Callback();
                            });
                        });
                    });
                });
            });
        });
    }, function () {
            clearInterval(UGD.Request);
            clearInterval(UGD.Save);
            UGD.Canceled = true;
            setTimeout(function () {
                UGD.Progress.innerHTML = UGD.OverallProgress = "";
            }, 500);
            UGDButton.classList.remove("rhBusy");
        });
        UGD.Progress = Popup.Progress;
        UGD.OverallProgress = Popup.OverallProgress;
        UGDButton.addEventListener("click", function () {
            UGD.Popup = Popup.popUp();
        });
    }

    function countUgdGiveaways(Frequencies, Giveaways, LevelsTotal, Total, type, Types, TypesTotal, UGD, Callback) {
        var Key, I, N, Giveaway, Private, Group, Whitelist, Region, Level, Copies;
                                for (Key in Giveaways) {
                                    for (I = 0, N = Giveaways[Key].length; I < N; ++I) {
                                        Giveaway = Giveaways[Key][I];
                                        if (Giveaway.entries > 0) {
                                            Private = Giveaway.inviteOnly;
                                            Group = Giveaway.group;
                                            Whitelist = Giveaway.whitelist;
                                            Region = Giveaway.regionRestricted;
                                            Level = Giveaway.level;
                                            Copies = (UGD.Key == "sent") ? Giveaway.copies : 1;
                                            if (Private) {
                                                if (Region) {
                                                    Types.Region_Invite[Level] += Copies;
                                                    TypesTotal.Region_Invite += Copies;
                                                } else {
                                                    Types.Invite[Level] += Copies;
                                                    TypesTotal.Invite += Copies;
                                                }
                                            } else if (Group) {
                                                if (Region) {
                                                    Types.Region_Group[Level] += Copies;
                                                    TypesTotal.Region_Group += Copies;
                                                } else if (Whitelist) {
                                                    if (Region) {
                                                        Types.Region_Group_Whitelist[Level] += Copies;
                                                        TypesTotal.Region_Group_Whitelist += Copies;
                                                    } else {
                                                        Types.Group_Whitelist[Level] += Copies;
                                                        TypesTotal.Group_Whitelist += Copies;
                                                    }
                                                } else {
                                                    Types.Group[Level] += Copies;
                                                    TypesTotal.Group += Copies;
                                                }
                                            } else if (Whitelist) {
                                                if (Region) {
                                                    Types.Region_Whitelist[Level] += Copies;
                                                    TypesTotal.Region_Whitelist += Copies;
                                                } else {
                                                    Types.Whitelist[Level] += Copies;
                                                    TypesTotal.Whitelist += Copies;
                                                }
                                            } else if (Region) {
                                                Types.Region[Level] += Copies;
                                                TypesTotal.Region += Copies;
                                            } else {
                                                Types.Everyone[Level] += Copies;
                                                TypesTotal.Everyone += Copies;
                                            }
                                            LevelsTotal[Level] += Copies;
                                            Total += Copies;
                                            if (UGD.Key == "sent") {
                                                if (!Frequencies[type]) {
                                                    Frequencies[type] = {};
                                                }
                                                if (!Frequencies[type][Key]) {
                                                    Frequencies[type][Key] = {
                                                        name: Giveaway.name,
                                                        frequency: 0
                                                    };
                                                }
                                                Frequencies[type][Key].frequency += Copies;
                                            } else {
                                                if (!Frequencies[type]) {
                                                    Frequencies[type] = {};
                                                }
                                                if (!Frequencies[type][Giveaway.creator]) {
                                                    Frequencies[type][Giveaway.creator] = {
                                                        name: Giveaway.creator,
                                                        frequency: 0
                                                    };
                                                }
                                                ++Frequencies[type][Giveaway.creator].frequency;
                                            }
                                        }
                                    }
                                }
        Callback(LevelsTotal, Total);
    }

    function getUGDGiveaways(UGD, ugd, NextPage, CurrentPage, CurrentContext, URL, Callback, Context) {
        var Giveaways, I, NumGiveaways, Giveaway, Found, Pagination;
        if (Context) {
            Giveaways = Context.getElementsByClassName("giveaway__row-outer-wrap");
            for (I = 0, NumGiveaways = Giveaways.length; I < NumGiveaways; ++I) {
                Giveaway = getGiveawayInfo(Giveaways[I], null, true).data;
                if (Giveaway.endTime < (new Date().getTime())) {
                    if (!UGD.Timestamp) {
                        UGD.Timestamp = Giveaway.endTime;
                    }
                    if (Giveaway.endTime > ugd[UGD.Key + "Timestamp"]) {
                        if (Giveaway.gameSteamId) {
                            if (!ugd[UGD.Key][Giveaway.gameType][Giveaway.gameSteamId]) {
                                ugd[UGD.Key][Giveaway.gameType][Giveaway.gameSteamId] = [];
                            }
                            ugd[UGD.Key][Giveaway.gameType][Giveaway.gameSteamId].push(Giveaway);
                        }
                    } else {
                        Found = true;
                        break;
                    }
                }
            }
            Pagination = Context.getElementsByClassName("pagination__navigation")[0];
            if (!Found && Pagination && !Pagination.lastElementChild.classList.contains("is-selected")) {
                window.setTimeout(getUGDGiveaways, 0, UGD, ugd, NextPage, CurrentPage, CurrentContext, URL, Callback);
            } else {
                ugd[UGD.Key + "Timestamp"] = UGD.Timestamp;
                Callback(ugd);
            }
        } else if (!UGD.Canceled) {
            UGD.Progress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>Retrieving giveaways (page " + NextPage + ")...</span>";
            queueRequest(UGD, null, URL + NextPage, function (Response) {
                window.setTimeout(getUGDGiveaways, 0, UGD, ugd, ++NextPage, CurrentPage, CurrentContext, URL, Callback, DOM.parse(Response.responseText));
            });
        }
    }

    /* Not Activated/Multiple Wins Checker */

    function loadNotActivatedMultipleWinsChecker() {
        if (esgst.user) {
            addNAMWCProfileButton(esgst.wonRow, esgst.user);
        } else if (esgst.winnersPath) {
            addNAMWCButton(esgst.mainPageHeading);
        } else if (esgst.menuPath) {
            addNAMWCButton();
        }
        if (esgst.ap) {
            esgst.profileFeatures.push(addNAMWCProfileButton);
        }
        if (esgst.namwc_h) {
            highlightNamwcUsers();
            esgst.endlessFeatures.push(highlightNamwcUsers);
        }
    }

    function addNAMWCProfileButton(Context, User) {
        if (Context.wonRow) {
            Context = Context.wonRow;
        }
        Context.insertAdjacentHTML(
            "beforeEnd",
            " <span class=\"NAMWCButton\">" +
            "    <i class=\"fa fa-question-circle\" title=\"Check for not activated / multiple wins\"></i>" +
            "</span>"
        );
        setNAMWCPopup(Context, User);
    }

    function addNAMWCButton(Context) {
        if (Context) {
            Context.insertAdjacentHTML(
                "afterBegin",
                "<a class=\"NAMWCButton\" title=\"Check for not activated / multiple wins\">" +
                "    <i class=\"fa fa-trophy\"></i>" +
                "    <i class=\"fa fa-question-circle\"></i>" +
                "</a>"
            );
        }
        setNAMWCPopup(Context);
    }

    function setNAMWCPopup(Context, User) {
        var Popup, NAMWC, NAMWCButton;
        Popup = createPopup();
        Popup.Popup.classList.add("rhPopupLarge");
        Popup.Icon.classList.add(Context ? "fa-question" : "fa-cog");
        NAMWC = {
            User: (User ? User : null)
        };
        Popup.Title.textContent = (Context ? "Check for " + (NAMWC.User ? (NAMWC.User.Username + "'s ") : "") + "not activated / multiple wins" :
            "Manage Not Activated / Multiple Wins Checker caches") + ":";
        NAMWCButton = (Context ? Context : document).getElementsByClassName("NAMWCButton")[0];
        if (Context) {
            createOptions(Popup.Options, NAMWC, [{
                Check: function () {
                    return true;
                },
                Description: "Only check for not activated wins.",
                Title: "If enabled, multiple wins will not be checked (faster).",
                Name: "NotActivatedCheck",
                Key: "NAC",
                ID: "NAMWC_NAC",
                Dependency: "MultipleCheck"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Only check for multiple wins.",
                Title: "If enabled, not activated wins will not be checked (faster).",
                Name: "MultipleCheck",
                Key: "MC",
                ID: "NAMWC_MC",
                Dependency: "NotActivatedCheck"
            }]);
            Popup.Options.insertAdjacentHTML("afterEnd", createDescription("If an user is highlighted, that means they have been either checked for the first time or updated."));
            createButton(Popup.Button, "fa-question-circle", "Check", "fa-times-circle", "Cancel", function (Callback) {
                NAMWC.ShowResults = false;
                NAMWCButton.classList.add("rhBusy");
                setNAMWCCheck(NAMWC, function () {
                    NAMWCButton.classList.remove("rhBusy");
                    Callback();
                });
            }, function () {
                clearInterval(NAMWC.Request);
                clearInterval(NAMWC.Save);
                NAMWC.Canceled = true;
                setTimeout(function () {
                    NAMWC.Progress.innerHTML = "";
                }, 500);
                NAMWCButton.classList.remove("rhBusy");
            });
        }
        NAMWC.Progress = Popup.Progress;
        NAMWC.OverallProgress = Popup.OverallProgress;
        createResults(Popup.Results, NAMWC, [{
            Icon: "<i class=\"fa fa-check-circle giveaway__column--positive\"></i> ",
            Description: "Users with 0 not activated wins",
            Key: "activated"
        }, {
            Icon: "<i class=\"fa fa-check-circle giveaway__column--positive\"></i> ",
            Description: "Users with 0 multiple wins",
            Key: "notMultiple"
        }, {
            Icon: "<i class=\"fa fa-times-circle giveaway__column--negative\"></i> ",
            Description: "Users with not activated wins",
            Key: "notActivated"
        }, {
            Icon: "<i class=\"fa fa-times-circle giveaway__column--negative\"></i> ",
            Description: "Users with multiple wins",
            Key: "multiple"
        }, {
            Icon: "<i class=\"fa fa-question-circle\"></i> ",
            Description: "Users who cannot be checked for not activated wins either because they have a private profile or SteamCommunity is down",
            Key: "unknown"
        }]);
        NAMWCButton.addEventListener("click", function () {
            NAMWC.Popup = Popup.popUp(function () {
                if (!Context) {
                    NAMWC.ShowResults = true;
                    setNAMWCCheck(NAMWC);
                }
            });
        });
    }

    function setNAMWCCheck(NAMWC, Callback) {
        var SavedUsers, I, N, Username;
        NAMWC.Progress.innerHTML = NAMWC.OverallProgress.innerHTML = "";
        NAMWC.activated.classList.add("rhHidden");
        NAMWC.notMultiple.classList.add("rhHidden");
        NAMWC.notActivated.classList.add("rhHidden");
        NAMWC.multiple.classList.add("rhHidden");
        NAMWC.unknown.classList.add("rhHidden");
        NAMWC.activatedCount.textContent = NAMWC.notMultipleCount.textContent = NAMWC.notActivatedCount.textContent = NAMWC.multipleCount.textContent = NAMWC.unknownCount.textContent = "0";
        NAMWC.activatedUsers.innerHTML = NAMWC.notMultipleUsers.textContent = NAMWC.notActivatedUsers.innerHTML = NAMWC.multipleUsers.innerHTML = NAMWC.unknownUsers.innerHTML = "";
        NAMWC.Popup.reposition();
        NAMWC.Users = [];
        NAMWC.Canceled = false;
        if (NAMWC.ShowResults) {
            SavedUsers = JSON.parse(GM_getValue(`users`));
            for (I in SavedUsers.users) {
                if (SavedUsers.users[I].namwc && SavedUsers.users[I].namwc.results) {
                    NAMWC.Users.push(SavedUsers.users[I].username);
                }
            }
            NAMWC.Users = sortArray(NAMWC.Users);
            for (I = 0, N = NAMWC.Users.length; I < N; ++I) {
                setNAMWCResult(NAMWC, SavedUsers.steamIds[NAMWC.Users[I]], NAMWC.Users[I], SavedUsers.users[SavedUsers.steamIds[NAMWC.Users[I]]].namwc, false);
            }
        } else if (NAMWC.User) {
            NAMWC.Users.push(NAMWC.User.Username);
            checkNAMWCUsers(NAMWC, 0, 1, Callback);
        } else {
            for (Username in esgst.users) {
                if (Username != GM_getValue("Username")) {
                    if (NAMWC.Users.length < 26) {
                        NAMWC.Users.push(Username);
                    } else {
                        break;
                    }
                }
            }
            NAMWC.Users = sortArray(NAMWC.Users);
            checkNAMWCUsers(NAMWC, 0, NAMWC.Users.length, Callback);
        }
    }

    function checkNAMWCUsers(NAMWC, I, N, Callback) {
        var User, Results, Key, newR;
        if (!NAMWC.Canceled) {
            NAMWC.Progress.innerHTML = "";
            NAMWC.OverallProgress.textContent = I + " of " + N + " users checked...";
            if (I < N) {
                User = NAMWC.User ? NAMWC.User : {
                    Username: NAMWC.Users[I]
                };
                createLock(`userLock`, 300, function(deleteLock) {
                var users = JSON.parse(GM_getValue(`users`));
                getSteamId(User.SteamID64, User.ID, User.Username, users, function(steamId) {
                    GM_setValue(`users`, JSON.stringify(users));
                    deleteLock();
                    var namwc = users.users[steamId].namwc;
                    var username = users.users[steamId].username;
                    if (namwc && namwc.results) {
                        Results = namwc.results;
                    }
                    checkNAMWCUser(NAMWC, namwc, username, function(namwc) {
                        if (Results) {
                            for (Key in Results) {
                                if (Results[Key] !== namwc.results[Key]) {
                                    newR = true;
                                    break;
                                }
                            }
                        } else {
                            newR = true;
                        }
                        window.setTimeout(setNAMWCResult, 0, NAMWC, steamId, username, namwc, newR, I, N, Callback);
                    });
                });
                });
            } else if (Callback) {
                Callback();
            }
        }
    }

    function setNAMWCResult(NAMWC, steamId, username, namwc, New, I, N, Callback) {
        var Key;
        if (!NAMWC.Canceled) {
            for (Key in namwc.results) {
                if (namwc.results[Key]) {
                    NAMWC[Key].classList.remove("rhHidden");
                    NAMWC[Key + "Count"].textContent = parseInt(NAMWC[Key + "Count"].textContent) + 1;
                    NAMWC[Key + "Users"].insertAdjacentHTML(
                        "beforeEnd",
                        "<a " + (New ? "class=\"rhBold rhItalic\" " : "") + "href=\"http://www.sgtools.info/" + (Key.match(/multiple/) ? "multiple" : "nonactivated") + "/" + username +
                        "\" target=\"_blank\">" + username + (Key.match(/^(notActivated|multiple)$/) ? (" (" + namwc.results[Key] + ")") : "") + "</a>"
                    );
                }
            }
            if (!NAMWC.ShowResults) {
                NAMWC.Popup.reposition();
                createLock(`userLock`, 300, function(deleteLock) {
                    var users = JSON.parse(GM_getValue(`users`));
                    users.users[steamId].namwc = namwc;
                    GM_setValue(`users`, JSON.stringify(users));
                    deleteLock();
                    window.setTimeout(checkNAMWCUsers, 0, NAMWC, ++I, N, Callback);
                });
            }
        }
    }

    function checkNAMWCUser(NAMWC, namwc, username, Callback) {
        if (!NAMWC.Canceled) {
            if (!namwc) {
                namwc = {
                    lastCheck: 0,
                    results: {}
                };
            }
            if ((Date.now() - namwc.lastCheck) > 604800000) {
                if (NAMWC.NAC.checked) {
                    checkNAMWCNotActivated(NAMWC, namwc, username, Callback);
                } else if (NAMWC.MC.checked) {
                    checkNAMWCMultiple(NAMWC, namwc, username, Callback);
                } else {
                    checkNAMWCNotActivated(NAMWC, namwc, username, function (namwc) {
                        checkNAMWCMultiple(NAMWC, namwc, username, Callback);
                    });
                }
            } else {
                Callback(namwc);
            }
        }
    }

    function checkNAMWCNotActivated(NAMWC, namwc, username, Callback) {
        var N, ResponseText;
        if (!NAMWC.Canceled) {
            NAMWC.Progress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>Retrieving " + username + "'s not activated wins...</span>";
            queueRequest(NAMWC, null, "http://www.sgtools.info/nonactivated/" + username, function (Response) {
                ResponseText = Response.responseText;
                if (ResponseText.match(/has a private profile/)) {
                    namwc.results.activated = false;
                    namwc.results.notActivated = 0;
                    namwc.results.unknown = true;
                } else {
                    N = DOM.parse(ResponseText).getElementsByClassName("notActivatedGame").length;
                    namwc.results.activated = N === 0 ? true : false;
                    namwc.results.notActivated = N;
                    namwc.results.unknown = false;
                }
                namwc.lastCheck = Date.now();
                Callback(namwc);
            });
        }
    }

    function checkNAMWCMultiple(NAMWC, namwc, username, Callback) {
        var N;
        if (!NAMWC.Canceled) {
            NAMWC.Progress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>Retrieving " + username + "'s multiple wins...</span>";
            queueRequest(NAMWC, null, "http://www.sgtools.info/multiple/" + username, function (Response) {
                N = DOM.parse(Response.responseText).getElementsByClassName("multiplewins").length;
                namwc.results.notMultiple = N === 0 ? true : false;
                namwc.results.multiple = N;
                namwc.lastCheck = Date.now();
                Callback(namwc);
            });
        }
    }

    function highlightNamwcUsers() {
        var key;
        if (Object.keys(esgst.currentUsers).length) {
            var users = JSON.parse(GM_getValue(`users`));
            for (key in users.users) {
                var id = esgst.sg ? users.users[key].username : key;
                if (esgst.currentUsers[id]) {
                    highlightNamwcUser(users.users[key], esgst.currentUsers[id]);
                }
            }
        }
    }

    function highlightNamwcUser(user, matches) {
        if (user.namwc && user.namwc.results) {
            var highlight, icon;
            if (user.namwc.results.activated && (user.namwc.results.notMultiple || (user.namwc.results.multiple && esgst.namwc_m))) {
                highlight = `positive`;
                icon = `fa-thumbs-up`;
            } else if (user.namwc.results.unknown) {
                highlight = `unknown`;
                icon = `fa-warning`;
            } else {
                highlight = `negative`;
                icon = `fa-thumbs-down`;
            }
            var i, n, context, title = `${user.username} has ${(user.namwc.results.unknown ? `?` : user.namwc.results.notActivated)} not activated wins and ${user.namwc.results.multiple} multiple wins (last checked ${getTimestamp(user.namwc.lastCheck / 1e3)})`;
            if (esgst.namwc_h_i || esgst.wbh_cw || esgst.wbh_cb) {
                var html = `
<span class="esgst-namwc-icon ${highlight}" title="${title}">
<i class="fa ${icon}"></i>
</span>
`;
                for (i = 0, n = matches.length; i < n; ++i) {
                    context = matches[i];
                    var container = context.parentElement;
                    if (container.classList.contains(`comment__username`)) {
                        context = container;
                    }
                    insertHtml(context, `beforeBegin`, html);
                }
            } else {
                for (i = 0, n = matches.length; i < n; ++i) {
                    context = matches[i];
                    context.classList.add(`esgst-namwc-highlight`, highlight);
                    context.title = title;
                }
            }
        }
    }

    /* Not Received Finder */

    function loadNotReceivedFinder(Context, User) {
        if (Context.context) {
            Context = Context.sentRow;
            addNRFButton(Context, User);
        } else {
            Context = esgst.sentRow;
            User = esgst.user;
            if (Context) {
                addNRFButton(Context, User);
            }
        }
    }

    function addNRFButton(Context, User) {
        var NRF;
        NRF = {
            N: parseInt(Context.nextElementSibling.firstElementChild.getAttribute("title").match(/, (.+) Not Received/)[1])
        };
        if (NRF.N > 0) {
            NRF.I = 0;
            NRF.Multiple = [];
            Context.insertAdjacentHTML(
                "beforeEnd",
                " <span class=\"NRFButton\">" +
                "    <i class=\"fa fa-times-circle\" title=\"Find not received giveaways\"></i>" +
                "</span>"
            );
            setNRFPopup(NRF, Context.lastElementChild, User);
        }
    }
    function setNRFPopup(NRF, NRFButton, User) {
        var Popup;
        Popup = createPopup();
        Popup.Popup.classList.add("rhPopupLarge");
        Popup.Icon.classList.add("fa-times");
        Popup.Title.textContent = "Find " + User.Username + "'s not received giveaways:";
        createOptions(Popup.Options, NRF, [{
            Check: function () {
                return true;
            },
            Description: "Also search inside giveaways with multiple copies.",
            Title: "If disabled, only giveaways with visible not received copies will be found (faster).",
            Name: "FullSearch",
            Key: "FS",
            ID: "NRF_FS"
        }]);
        Popup.Options.insertAdjacentHTML("afterEnd", createDescription("If you're blacklisted / not whitelisted / not a member of the same Steam groups, not all giveaways will be found."));
        createButton(Popup.Button, "fa-search", "Find", "fa-times-circle", "Cancel", function (Callback) {
            NRFButton.classList.add("rhBusy");
            setNRFSearch(NRF, User, function () {
                NRF.Progress.innerHTML = "";
                NRFButton.classList.remove("rhBusy");
                Callback();
            });
        }, function () {
            clearInterval(NRF.Request);
            clearInterval(NRF.Save);
            NRF.Canceled = true;
            setTimeout(function () {
                NRF.Progress.innerHTML = "";
            }, 500);
            NRFButton.classList.remove("rhBusy");
        });
        NRF.Progress = Popup.Progress;
        NRF.OverallProgress = Popup.OverallProgress;
        NRF.Results = Popup.Results;
        NRFButton.addEventListener("click", function () {
            NRF.Popup = Popup.popUp();
        });
    }

    function setNRFSearch(NRF, User, Callback) {
        NRF.Progress.innerHTML = NRF.OverallProgress.innerHTML = NRF.Results.innerHTML = "";
        NRF.Popup.reposition();
        NRF.Canceled = false;
        createLock(`userLock`, 300, function(deleteLock) {
            var users = JSON.parse(GM_getValue(`users`));
            getSteamId(User.SteamID64, User.ID, User.Username, users, function(steamId) {
                GM_setValue(`users`, JSON.stringify(users));
                deleteLock();
                var nrf = users.users[steamId].nrf;
                var username = users.users[steamId].username;
                if (!nrf) {
                    nrf = {
                        lastCheck: 0,
                        found: 0,
                        total: 0,
                        results: ``
                    };
                }
                if ((Date.now() - nrf.lastCheck) > 604800000) {
                    searchNRFUser(NRF, username, 1, 0, "/user/" + username + "/search?page=", function () {
                        createLock(`userLock`, 300, function(deleteLock) {
                            users = JSON.parse(GM_getValue(`users`));
                            nrf.lastCheck = Date.now();
                            nrf.found = NRF.I;
                            nrf.total = NRF.N;
                            nrf.results = NRF.Results.innerHTML;
                            users.users[steamId].nrf = nrf;
                            GM_setValue(`users`, JSON.stringify(users));
                            deleteLock();
                            loadEndlessFeatures(NRF.Results);
                            NRF.Progress.innerHTML = ``;
                            Callback();
                        });
                    });
                } else {
                    NRF.Results.innerHTML = nrf.results;
                    NRF.OverallProgress.innerHTML = nrf.found + " of " + nrf.total + " not received giveaways found...";
                    NRF.Popup.reposition();
                    loadEndlessFeatures(NRF.Results);
                    Callback();
                }
            });
        });
    }

    function searchNRFUser(NRF, username, NextPage, CurrentPage, URL, Callback, Context) {
        var Matches, I, N, Match, Pagination;
        if (Context) {
            Matches = Context.querySelectorAll("div.giveaway__column--negative");
            for (I = 0, N = Matches.length; I < N; ++I) {
                NRF.I += Matches[I].querySelectorAll("a[href*='/user/']").length;
                NRF.Results.appendChild(Matches[I].closest(".giveaway__row-outer-wrap").cloneNode(true));
                NRF.Popup.reposition();
            }
            NRF.OverallProgress.innerHTML = NRF.I + " of " + NRF.N + " not received giveaways found...";
            if (NRF.I < NRF.N) {
                if (NRF.FS.checked) {
                    Matches = Context.getElementsByClassName("giveaway__heading__thin");
                    for (I = 0, N = Matches.length; I < N; ++I) {
                        Match = Matches[I].textContent.match(/\((.+) Copies\)/);
                        if (Match && (parseInt(Match[1]) > 3)) {
                            NRF.Multiple.push(Matches[I].closest(".giveaway__row-outer-wrap").cloneNode(true));
                        }
                    }
                }
                Pagination = Context.getElementsByClassName("pagination__navigation")[0];
                if (Pagination && !Pagination.lastElementChild.classList.contains("is-selected")) {
                    window.setTimeout(searchNRFUser, 0, NRF, username, NextPage, CurrentPage, URL, Callback);
                } else if (NRF.FS.checked && NRF.Multiple.length) {
                    window.setTimeout(searchNRFMultiple, 0, NRF, 0, NRF.Multiple.length, Callback);
                } else {
                    Callback();
                }
            } else {
                Callback();
            }
        } else if (!NRF.Canceled) {
            NRF.Progress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>Searching " + username + "'s giveaways (page " + NextPage + ")...</span>";
            queueRequest(NRF, null, URL + NextPage, function (Response) {
                window.setTimeout(searchNRFUser, 0, NRF, username, ++NextPage, CurrentPage, URL, Callback, DOM.parse(Response.responseText));
            });
        }
    }

    function searchNRFMultiple(NRF, I, N, Callback) {
        if (!NRF.Canceled) {
            NRF.Progress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>Searching inside giveaways with multiple copies (" + I + " of " + N + ")...</span>";
            if (I < N) {
                searchNRFGiveaway(NRF, NRF.Multiple[I].getElementsByClassName("giveaway__heading__name")[0].getAttribute("href") + "/winners/search?page=", 1, function (Found) {
                    if (Found) {
                        NRF.Results.appendChild(NRF.Multiple[I].cloneNode(true));
                    }
                    if (NRF.I < NRF.N) {
                        window.setTimeout(searchNRFMultiple, 0, NRF, ++I, N, Callback);
                    } else {
                        Callback();
                    }
                });
            } else {
                Callback();
            }
        }
    }

    function searchNRFGiveaway(NRF, URL, NextPage, Callback) {
        if (!NRF.Canceled) {
            queueRequest(NRF, null, URL + NextPage, function (Response) {
                var ResponseHTML, Matches, I, N, Found, Pagination;
                ResponseHTML = DOM.parse(Response.responseText);
                Matches = ResponseHTML.getElementsByClassName("table__column--width-small");
                for (I = 0, N = Matches.length; I < N; ++I) {
                    if (Matches[I].textContent.match(/Not Received/)) {
                        Found = true;
                        ++NRF.I;
                        NRF.OverallProgress.innerHTML = NRF.I + " of " + NRF.N + " not received giveaways found...";
                        if (NRF.I >= NRF.N) {
                            break;
                        }
                    }
                }
                Pagination = ResponseHTML.getElementsByClassName("pagination__navigation")[0];
                if ((NRF.I < NRF.N) && Pagination && !Pagination.lastElementChild.classList.contains("is-selected")) {
                    window.setTimeout(searchNRFGiveaway, 0, NRF, URL, ++NextPage, Callback);
                } else {
                    Callback(Found);
                }
            });
        }
    }

    /* Sent/Won Ratio */

    function loadSentWonRatio(context, user) {
        var wonRow, sentRow;
        if (context.context) {
            wonRow = context.wonRow;
            sentRow = context.sentRow;
        } else {
            wonRow = esgst.wonRow;
            sentRow = esgst.sentRow;
            user = esgst.user;
        }
        if (wonRow && sentRow) {
            addSWRRatio(wonRow, sentRow, user);
        }

    }

    function addSWRRatio(Won, Sent, User) {
        var WonCount, SentCount, Ratio;
        WonCount = parseInt(Won.nextElementSibling.firstElementChild.textContent.replace(/,/, ""));
        SentCount = parseInt(Sent.nextElementSibling.firstElementChild.firstElementChild.textContent.replace(/,/, ""));
        Ratio = (WonCount > 0) ? (Math.round(SentCount / WonCount * 100) / 100) : 0;
        Sent.parentElement.insertAdjacentHTML(
            "afterEnd",
            "<div class=\"featured__table__row SWRRatio\">" +
            "    <div class=\"featured__table__row__left\">Ratio</div>" +
            "    <div class=\"featured__table__row__right\" title=\"" + User.Username + " has sent " + Ratio + " gifts for every gift won\">" + Ratio + "</div>" +
            "</div>"
        );
    }

    /* Level Up Calculator */

    function loadLevelUpCalculator(context) {
        if (context.context) {
            calculateLUCValue(context.contributorLevelRow);
        } else {
            context = esgst.contributorLevelRow;
            if (context) {
                calculateLUCValue(context);
            }
        }
    }

    function calculateLUCValue(Context) {
        var Level, Base, Values, Lower, Upper, Value;
        Context = Context.nextElementSibling;
        Level = parseFloat(Context.firstElementChild.getAttribute("title"));
        Base = parseInt(Level);
        if (Base < 10) {
            Values = [0, 0.01, 25.01, 50.01, 100.01, 250.01, 500.01, 1000.01, 2000.01, 3000.01, 5000.01];
            Lower = Values[Base];
            Upper = Values[Base + 1];
            Value = Math.round((Upper - (Lower + ((Upper - Lower) * (Level - Base)))) * 100) / 100;
            Context.insertAdjacentHTML("beforeEnd", " <span>(~ $" + Value + " real CV to level " + (Base + 1) + ")");
        }

    }

    /* SteamGifts Profile Button */

    function loadSteamGiftsProfileButton() {
        var Context;
        var User = esgst.user;
        var SteamButton = esgst.steamButton;
        Context = document.getElementsByClassName("profile_links")[0];
        Context.insertAdjacentHTML(
            "beforeEnd",
            "<div class=\"profile_reputation\">" +
            "    <a class=\"btn_action white SGPBButton\" href=\"https://www.steamgifts.com/go/user/" + User.SteamID64 + "\" rel=\"nofollow\" target=\"_blank\">" +
            "        <i class=\"fa\">" +
            "            <img src=\"https://cdn.steamgifts.com/img/favicon.ico\"/>" +
            "        </i>" +
            "        <span>Visit SteamGifts Profile</span>" +
            "    </a>" +
            "</div>"
        );
        Context = Context.lastElementChild;
        Context.insertBefore(SteamButton, Context.firstElementChild);
    }

    /* SteamTrades Profile Button */

    function loadSteamTradesProfileButton(Context, User) {
        var STPBButton;
        if (Context.context || esgst.userPath) {
            if (Context.context) {
                Context = Context.context;
            } else {
                User = esgst.user;
            }
            Context = Context.getElementsByClassName("sidebar__shortcut-inner-wrap")[0];
            Context.insertAdjacentHTML(
                "beforeEnd",
                "<a class=\"STPBButton\" href=\"https://www.steamtrades.com/user/" + User.SteamID64 + "\" rel=\"nofollow\" target=\"_blank\">" +
                "    <i class=\"fa fa-fw\">" +
                "        <img src=\"https://cdn.steamtrades.com/img/favicon.ico\"/>" +
                "    </i>" +
                "</a>"
            );
            STPBButton = Context.lastElementChild;
            Context = Context.parentElement.getElementsByClassName("js-tooltip")[0];
            if (Context) {
                STPBButton.addEventListener("mouseenter", function () {
                    Context.textContent = "Visit SteamTrades Profile";
                    setSiblingsOpacity(STPBButton, "0.2");
                });
                STPBButton.addEventListener("mouseleave", function () {
                    setSiblingsOpacity(STPBButton, "1");
                });
            }
        }
    }

    /* Shared Groups Checker */

    function loadSharedGroupsChecker(MainContext, User) {
        var SGCButton, Popup, Context;
        if (MainContext == document) {
            Context = esgst.featuredHeading;
            User = esgst.user;
        } else {
            Context = MainContext.heading;
            MainContext = MainContext.context;
        }
        if (Context && User && (User.Username != GM_getValue(`Username`))) {
            Context.insertAdjacentHTML(
                "beforeEnd",
                "<a class=\"SGCButton\">" +
                "    <i class=\"fa fa-fw fa-users\"></i>" +
                "</a>"
            );
            SGCButton = Context.lastElementChild;
            SGCButton.addEventListener("click", function () {
                var SGCPopup;
                if (Popup) {
                    Popup.popUp();
                } else {
                    Popup = createPopup();
                    Popup.Icon.classList.add("fa-users");
                    Popup.Title.textContent = "Shared Groups";
                    Popup.OverallProgress.innerHTML =
                        "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                        "<span>Checking shared groups...</span>";
                    SGCPopup = Popup.popUp();
                    makeRequest(null, "http://www.steamcommunity.com/profiles/" + User.SteamID64 + "/groups", Popup.Progress, function (Response) {
                        var ResponseHTML, Matches, Groups, I, NumMatches, Name, J, NumGroups, Avatar;
                        Popup.OverallProgress.innerHTML = "";
                        ResponseHTML = DOM.parse(Response.responseText);
                        Matches = ResponseHTML.getElementsByClassName("linkTitle");
                        Groups = GM_getValue("Groups");
                        for (I = 0, NumMatches = Matches.length; I < NumMatches; ++I) {
                            Name = Matches[I].textContent;
                            for (J = 0, NumGroups = Groups.length; (J < NumGroups) && (Groups[J].Name != Name); ++J);
                            if (J < NumGroups) {
                                Avatar = Matches[I].parentElement.previousElementSibling.firstElementChild.firstElementChild.firstElementChild.getAttribute("src");
                                Popup.Results.insertAdjacentHTML(
                                    "beforeEnd",
                                    "<li class=\"table__row-outer-wrap\">" +
                                    "    <div class=\"table__row-inner-wrap\">" +
                                    "        <div>" +
                                    "            <span>" +
                                    "                <a class=\"global__image-outer-wrap global__image-outer-wrap--avatar-small\" href=\"/group/" + Groups[J].Code + "/\">" +
                                    "                    <div class=\"global__image-inner-wrap\" style=\"background-image:url(" + Avatar + ");\"></div>" +
                                    "                </a>" +
                                    "            </span>" +
                                    "        </div>" +
                                    "        <div class=\"table__column--width-fill\">" +
                                    "            <a class=\"table__column__heading\" href=\"/group/" + Groups[J].Code + "/\">" + Groups[J].Name + "</a>" +
                                    "        </div>" +
                                    "    </div>" +
                                    "</li>"
                                );
                            }
                        }
                        if (!Popup.Results.innerHTML) {
                            Popup.Results.innerHTML = "<div>No shared groups found.</div>";
                        }
                        loadEndlessFeatures(Popup.Results);
                        SGCPopup.reposition();
                    });
                }
            });
        }
    }

    /* User Filters */

    function loadUf() {
        if (esgst.sg) {
            if (esgst.userPath || esgst.ap) {
                esgst.profileFeatures.push(addUfButton);
                addUfButton(document);
            }
            if (!esgst.userPath && !esgst.giveawayPath) {
                esgst.endlessFeatures.push(filterUserGiveaways);
                filterUserGiveaways(document);
            }
            esgst.endlessFeatures.push(filterUserPosts);
            filterUserPosts(document);
            if (esgst.discussionsPath || esgst.giveawaysPath) {
                esgst.endlessFeatures.push(filterUserDiscussions);
                filterUserDiscussions(document);
            }
        }
    }

    function filterUserGiveaways() {
        var users = JSON.parse(GM_getValue(`users`));
        for (var i = 0, n = esgst.giveaways.length; i < n; ++i) {
            var giveaway = esgst.giveaways[i];
            if (giveaway.creator && users.steamIds[giveaway.creator] && users.users[users.steamIds[giveaway.creator]] && ((users.users[users.steamIds[giveaway.creator]].uf && users.users[users.steamIds[giveaway.creator]].uf.giveaways) || (!users.users[users.steamIds[giveaway.creator]].uf && users.users[users.steamIds[giveaway.creator]].blacklisted && esgst.uf_g))) {
                giveaway.outerWrap.remove();
            }
        }
    }
    function filterUserPosts(context) {
        var comments = getComments(context, document);
        var users = JSON.parse(GM_getValue(`users`));
        for (var i = 0, n = comments.length; i < n; ++i) {
            if (comments[i].author && users.steamIds[comments[i].author] && users.users[users.steamIds[comments[i].author]] && ((users.users[users.steamIds[comments[i].author]].uf && users.users[users.steamIds[comments[i].author]].uf.posts) || (!users.users[users.steamIds[comments[i].author]].uf && users.users[users.steamIds[comments[i].author]].blacklisted && esgst.uf_p))) {
                var commentC = comments[i].comment.closest(`.comment`);
                if (esgst.inboxPath) {
                    var commentsC = commentC.parentElement;
                        commentC.remove();
                        if (!commentsC.children.length) {
                            var previous = commentsC.previousElementSibling;
                            if (previous.classList.contains(`comments__entity`)) {
                                previous.remove();
                            }
                            commentsC.remove();
                        }
                } else {
                    commentC.remove();
                }
            }
        }
    }

    function filterUserDiscussions(context) {
        var matches = context.getElementsByClassName(`table__row-outer-wrap`);
        var users = JSON.parse(GM_getValue(`users`));
        for (var i = 0; i < matches.length; ++i) {
            var link = matches[i].querySelector(`.table__column__secondary-link[href*="/user/"]`);
            if (link) {
                var op = link.getAttribute(`href`).match(/\/user\/(.+)/)[1];
                if (users.steamIds[op] && users.users[users.steamIds[op]] && ((users.users[users.steamIds[op]].uf && users.users[users.steamIds[op]].uf.discussions) || (!users.users[users.steamIds[op]].uf && users.users[users.steamIds[op]].blacklisted && esgst.uf_d))) {
                    matches[i].remove();
                    --i;
                }
            }
        }
    }

    function addUfButton(MainContext, User) {
        var Context;
        if (MainContext == document) {
            Context = esgst.featuredHeading;
            User = esgst.user;
        } else {
            Context = MainContext.heading;
            MainContext = MainContext.context;
        }
        if (Context && User && (User.Username != GM_getValue(`Username`))) {
            var users = JSON.parse(GM_getValue(`users`));
            var icon;
            if (users.users[User.SteamID64] && users.users[User.SteamID64].uf && (users.users[User.SteamID64].uf.posts || users.users[User.SteamID64].uf.discussions || users.users[User.SteamID64].uf.giveaways)) {
                icon = `fa-eye-slash`;
            } else {
                icon = `fa-eye`;
            }
            var button = insertHtml(Context, `beforeEnd`, `
                <a>
                    <i class="fa ${icon}"></i>
                </a>
            `);
            var popup, steamId, options, progress, posts, giveaways, discussions, uf;
            button.addEventListener(`click`, function() {
                if (!popup) {
                popup = createPopup_v6(`fa-eye`, `Apply user filters for <span>${User.Username}</span>:`);
                options = insertHtml(popup.description, `beforeEnd`, `
                    <div>
                        <div>
                            <span>Filter out this user's posts.</span>
                        </div>
                        <div>
                            <span>Filter out user's discussions.</span>
                        </div>
                        <div>
                            <span>Filter out user's giveaways.</span>
                        </div>
                    </div>
                `);
                progress = insertHtml(popup.description, `afterBegin`, `
                    <div>
                        <i class="fa fa-circle-o-notch fa-spin"></i>
                        <span>Loading user settings...</span>
                    </div>
                `);
                button = createButtonSet(`green`, `grey`, `fa-check`, `fa-circle-o-notch fa-spin`, `Save Settings`, `Saving...`, function(callback) {
                    createLock(`userLock`, 300, function(deleteLock) {
                        uf.posts = posts.input.checked;
                        uf.discussions = discussions.input.checked;
                        uf.giveaways = giveaways.input.checked;
                        users = JSON.parse(GM_getValue(`users`));
                        users.users[steamId].uf = uf;
                        GM_setValue(`users`, JSON.stringify(users));
                        deleteLock();
                        callback();
                        popup.opened.close();
                    });
                });
                    popup.description.appendChild(button.set);
                popup.open();
                createLock(`userLock`, 300, function(deleteLock) {
                    users = JSON.parse(GM_getValue(`users`));
                    getSteamId(User.SteamID64, User.ID, User.Username, users, function(steamIdd) {
                        steamId = steamIdd;
                        GM_setValue(`users`, JSON.stringify(users));
                        deleteLock();
                        uf = users.users[steamId].uf;
                        if (!uf) {
                            uf = {
                                posts: false,
                                discussions: false,
                                giveaways: false
                            };
                        }
                        posts = createCheckbox_v6(options.firstElementChild, uf.posts);
                        discussions = createCheckbox_v6(options.firstElementChild.nextElementSibling, uf.discussions);
                        giveaways = createCheckbox_v6(options.lastElementChild, uf.giveaways);
                        progress.remove();
                    });
                });
                } else {
                    popup.open();
                }
            });
        }
    }

    /* Whitelist/Blacklist Checker */

    function loadWhitelistBlacklistChecker() {
        var keys, n;
        keys = Object.keys(esgst.currentUsers);
        n = keys.length;
        if (esgst.menuPath) {
            addWBCButton();
        } else if (n > 0) {
            if (n > 1 || (keys[0] !== GM_getValue(`Username`) && keys[0] !== `cg`)) {
                addWBCButton(esgst.mainPageHeading);
            }
        }
        if (esgst.wbc_h) {
            addWbcIcons();
            esgst.endlessFeatures.push(addWbcIcons);
        }
    }

    function addWBCButton(Context) {
        var Popup, WBC, WBCButton;
        Popup = createPopup();
        WBC = {
            Update: (Context ? false : true),
            B: esgst.wbc_b,
            Username: GM_getValue("Username")
        };
        Popup.Popup.classList.add("rhPopupLarge");
        Popup.Icon.classList.add(WBC.Update ? "fa-cog" : "fa-question");
        Popup.Title.textContent = (WBC.Update ? "Manage Whitelist / Blacklist Checker caches" : ("Check for whitelists" + (WBC.B ? " / blacklists" : ""))) + ":";
        if (window.location.pathname.match(new RegExp("^\/user\/(?!" + WBC.Username + ")"))) {
            WBC.User = {
                Username: document.getElementsByClassName("featured__heading__medium")[0].textContent,
                ID: document.querySelector("[name='child_user_id']").value,
                SteamID64: document.querySelector("a[href*='/profiles/']").href.match(/\d+/)[0],
            };
        }
        createOptions(Popup.Options, WBC, [{
            Check: function () {
                return WBC.User;
            },
            Description: "Only check " + (WBC.User ? WBC.User.Username : "current user") + ".",
            Title: "If disabled, all users in the current page will be checked.",
            Name: "SingleCheck",
            Key: "SC",
            ID: "WBC_SC",
            Dependency: "FullListCheck"
        }, {
            Check: function () {
                return WBC.B;
            },
            Description: "Also check whitelist.",
            Title: "If disabled, a blacklist-only check will be performed (faster).",
            Name: "FullCheck",
            Key: "FC",
            ID: "WBC_FC"
        }, {
            Check: function () {
                return ((((WBC.User && !WBC.SC.checked) || !WBC.User) && !WBC.Update && !window.location.pathname.match(/^\/(discussions|users|archive)/)) ? true : false);
            },
            Description: "Check all pages.",
            Title: "If disabled, only the current page will be checked.",
            Name: "FullListCheck",
            Key: "FLC",
            ID: "WBC_FLC"
        }, {
            Check: function () {
                return true;
            },
            Description: "Return whitelists.",
            Title: "If enabled, everyone who has whitelisted you will be whitelisted back.",
            Name: "ReturnWhitelists",
            Key: "RW",
            ID: "WBC_RW"
        }, {
            Check: function () {
                return WBC.B;
            },
            Description: "Return blacklists.",
            Title: "If enabled, everyone who has blacklisted you will be blacklisted back.",
            Name: "ReturnBlacklists",
            Key: "RB",
            ID: "WBC_RB"
        }, {
            Check: function () {
                return WBC.Update;
            },
            Description: "Only update whitelists / blacklists.",
            Title: "If enabled, only users who have whitelisted / blacklisted you will be updated (faster).",
            Name: "SimpleUpdate",
            Key: "SU",
            ID: "WBC_SU"
        }, {
            Check: function () {
                return true;
            },
            Description: "Clear caches.",
            Title: "If enabled, the caches of all checked users will be cleared (slower).",
            Name: "ClearCaches",
            Key: "CC",
            ID: "WBC_CC"
        }]);
        Popup.Options.insertAdjacentHTML("afterEnd", createDescription("If an user is highlighted, that means they have been either checked for the first time or updated."));
        if (Context) {
            Context.insertAdjacentHTML(
                "afterBegin",
                "<a class=\"WBCButton\" title=\"Check for whitelists" + (WBC.B ? " / blacklists" : "") + "\">" +
                "    <i class=\"fa fa-heart\"></i> " + (WBC.B ? (
                    "<i class=\"fa fa-ban\"></i>") : "") +
                "    <i class=\"fa fa-question-circle\"></i>" +
                "</a>"
            );
        }
        WBCButton = document.getElementsByClassName("WBCButton")[0];
        createButton(Popup.Button, WBC.Update ? "fa-refresh" : "fa-question-circle", WBC.Update ? "Update" : "Check", "fa-times-circle", "Cancel", function (Callback) {
            WBC.ShowResults = false;
            WBCButton.classList.add("rhBusy");
            setWBCCheck(WBC, function () {
                WBCButton.classList.remove("rhBusy");
                Callback();
            });
        }, function () {
            clearInterval(WBC.Request);
            clearInterval(WBC.Save);
            WBC.Canceled = true;
            setTimeout(function () {
                WBC.Progress.innerHTML = "";
            }, 500);
            WBCButton.classList.remove("rhBusy");
        });
        WBC.Progress = Popup.Progress;
        WBC.OverallProgress = Popup.OverallProgress;
        createResults(Popup.Results, WBC, [{
            Icon: (
                "<span class=\"sidebar__shortcut-inner-wrap rhWBIcon\">" +
                "    <i class=\"fa fa-heart sidebar__shortcut__whitelist is-disabled is-selected\" style=\"background: none !important;\"></i> " +
                "</span>"
            ),
            Description: "You are whitelisted by",
            Key: "whitelisted"
        }, {
            Icon: (
                "<span class=\"sidebar__shortcut-inner-wrap rhWBIcon\">" +
                "    <i class=\"fa fa-ban sidebar__shortcut__blacklist is-disabled is-selected\" style=\"background: none !important;\"></i> " +
                "</span>"
            ),
            Description: "You are blacklisted by",
            Key: "blacklisted"
        }, {
            Icon: "<i class=\"fa fa-check-circle\"></i> ",
            Description: "You are neither whitelisted nor blacklisted by",
            Key: "none"
        }, {
            Icon: "<i class=\"fa fa-question-circle\"></i> ",
            Description: "You are not blacklisted and there is not enough information to know if you are whitelisted by",
            Key: "notBlacklisted"
        }, {
            Icon: "<i class=\"fa fa-question-circle\"></i> ",
            Description: "There is not enough information to know if you are whitelisted or blacklisted by",
            Key: "unknown"
        }]);
        WBCButton.addEventListener("click", function () {
            WBC.Popup = Popup.popUp(function () {
                if (WBC.Update) {
                    WBC.ShowResults = true;
                    setWBCCheck(WBC);
                }
            });
        });
    }

    function setWBCCheck(WBC, Callback) {
        var SavedUsers, I, N, Username;
        WBC.Progress.innerHTML = WBC.OverallProgress.innerHTML = "";
        WBC.whitelisted.classList.add("rhHidden");
        WBC.blacklisted.classList.add("rhHidden");
        WBC.none.classList.add("rhHidden");
        WBC.notBlacklisted.classList.add("rhHidden");
        WBC.unknown.classList.add("rhHidden");
        WBC.whitelistedCount.textContent = WBC.blacklistedCount.textContent = WBC.noneCount.textContent = WBC.notBlacklistedCount.textContent = WBC.unknownCount.textContent = "0";
        WBC.whitelistedUsers.innerHTML = WBC.blacklistedUsers.innerHTML = WBC.noneUsers.innerHTML = WBC.notBlacklistedUsers.innerHTML = WBC.unknownUsers.innerHTML = "";
        WBC.Popup.reposition();
        WBC.Users = [];
        WBC.Canceled = false;
        if (WBC.Update) {
            SavedUsers = JSON.parse(GM_getValue(`users`));
            for (I in SavedUsers.users) {
                if (SavedUsers.users[I].wbc && SavedUsers.users[I].wbc.result && (WBC.ShowResults || (!WBC.ShowResults && ((WBC.SU.checked && SavedUsers.users[I].wbc.result.match(/^(whitelisted|blacklisted)$/)) || !WBC.SU.checked)))) {
                    WBC.Users.push(SavedUsers.users[I].username);
                }
            }
            WBC.Users = sortArray(WBC.Users);
            if (WBC.ShowResults) {
                for (I = 0, N = WBC.Users.length; I < N; ++I) {
                    setWBCResult(WBC, SavedUsers.steamIds[WBC.Users[I]], WBC.Users[I], SavedUsers.users[SavedUsers.steamIds[WBC.Users[I]]].wbc, SavedUsers.users[SavedUsers.steamIds[WBC.Users[I]]].whitelisted, SavedUsers.users[SavedUsers.steamIds[WBC.Users[I]]].blacklisted, false);
                }
            } else {
                checkWBCUsers(WBC, 0, WBC.Users.length, Callback);
            }
        } else if (WBC.User && WBC.SC.checked) {
            WBC.Users.push(WBC.User.Username);
            checkWBCUsers(WBC, 0, 1, Callback);
        } else {
            for (Username in esgst.users) {
                if (Username != WBC.Username) {
                    WBC.Users.push(Username);
                }
            }
            if (WBC.FLC.checked && ((((WBC.User && !WBC.SC.checked) || !WBC.User) && !WBC.Update && !window.location.pathname.match(/^\/(discussions|users|archive)/)))) {
                getWBCUsers(WBC, 1, esgst.currentPage, esgst.searchUrl, function () {
                    WBC.Users = sortArray(WBC.Users);
                    checkWBCUsers(WBC, 0, WBC.Users.length, Callback);
                });
            } else {
                WBC.Users = sortArray(WBC.Users);
                checkWBCUsers(WBC, 0, WBC.Users.length, Callback);
            }
        }
    }

    function checkWBCUsers(WBC, I, N, Callback) {
        var User, Result;
        if (!WBC.Canceled) {
            WBC.Progress.innerHTML = "";
            WBC.OverallProgress.textContent = I + " of " + N + " users checked...";
            if (I < N) {
                User = (WBC.User && WBC.SC.checked) ? WBC.User : {
                    Username: WBC.Users[I]
                };
                createLock(`userLock`, 300, function(deleteLock) {
                    var users = JSON.parse(GM_getValue(`users`));
                    getSteamId(User.SteamID64, User.ID, User.Username, users, function(steamId) {
                        GM_setValue(`users`, JSON.stringify(users));
                        deleteLock();
                        var username = users.users[steamId].username;
                        var whitelisted = users.users[steamId].whitelisted;
                        var blacklisted = users.users[steamId].blacklisted;
                        var wbc = users.users[steamId].wbc;
                        if (wbc && wbc.result) {
                            Result = wbc.result;
                        }
                        checkWBCUser(WBC, wbc, username, function (wbc) {
                            setTimeout(setWBCResult, 0, WBC, steamId, username, wbc, whitelisted, blacklisted, (Result != wbc.result) ? true : false, I, N, Callback);
                        });
                    });
                });
            } else if (Callback) {
                Callback();
            }
        }
    }

    function setWBCResult(WBC, steamId, username, wbc, whitelisted, blacklisted, New, I, N, Callback) {
        var Key;
        if (!WBC.Canceled) {
            Key = ((wbc.result === `blacklisted`) && !WBC.B) ? "unknown" : wbc.result;
            WBC[Key].classList.remove("rhHidden");
            WBC[Key + "Count"].textContent = parseInt(WBC[Key + "Count"].textContent) + 1;
            WBC[Key + "Users"].insertAdjacentHTML("beforeEnd", "<a " + (New ? "class=\"rhBold rhItalic\" " : "") + "href=\"/user/" + username + "\">" + username + "</a>");
            if (!WBC.ShowResults) {
                WBC.Popup.reposition();
                if ((WBC.RW.checked && (wbc.result === `whitelisted`) && !whitelisted) || (WBC.B && WBC.RB.checked && (wbc.result === `blacklisted`) && !blacklisted)) {
                    createLock(`userLock`, 300, function(deleteLock) {
                        var users = JSON.parse(GM_getValue(`users`));
                        getUserID(steamId, users, function(id) {
                            returnWBCWhitelistBlacklist(WBC, wbc, username, id, users.users[steamId].notes, function (success, notes) {
                                if (success) {
                                    users.users[steamId].notes = notes;
                                    delete users.users[steamId].whitelisted;
                                    delete users.users[steamId].blacklisted;
                                    users.users[steamId][wbc.result] = true;
                                }
                                users.users[steamId].wbc = wbc;
                                GM_setValue(`users`, JSON.stringify(users));
                                deleteLock();
                                window.setTimeout(checkWBCUsers, 0, WBC, ++I, N, Callback);
                            });
                        });
                    });
                } else {
                    createLock(`userLock`, 300, function(deleteLock) {
                        var users = JSON.parse(GM_getValue(`users`));
                        users.users[steamId].wbc = wbc;
                        GM_setValue(`users`, JSON.stringify(users));
                        deleteLock();
                        window.setTimeout(checkWBCUsers, 0, WBC, ++I, N, Callback);
                    });
                }
            }
        }
    }

    function returnWBCWhitelistBlacklist(WBC, wbc, username, id, notes, Callback) {
        var Key, Type;
        if (!WBC.Canceled) {
            Key = wbc.result;
            Type = Key.match(/(.+)ed/)[1];
            WBC.Progress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>Returning " + Type + " for " + username + "...</span>";
            if (window.location.pathname.match(new RegExp("^\/user\/" + username))) {
                document.getElementsByClassName("sidebar__shortcut__" + Type)[0].click();
                if (esgst.wbc_n) {
                    var msg = `Returned ${Type}.`;
                    if (notes) {
                        notes = `${msg}\n\n${notes}`;
                    } else {
                        notes = msg;
                    }
                }
                Callback(true, notes);
            } else {
                queueRequest(WBC, "xsrf_token=" + esgst.xsrfToken + "&do=" + Type + "&child_user_id=" + id + "&action=insert", "/ajax.php", function (Response) {
                    var success = false;
                    if (JSON.parse(Response.responseText).type == "success") {
                        success = true;
                        if (esgst.wbc_n) {
                            var msg = `${Key} in return.`;
                            if (notes) {
                                notes = `${msg}\n\n${notes}`;
                            } else {
                                notes = msg;
                            }
                        }
                    }
                    Callback(success, notes);
                });
            }
        }
    }

    function checkWBCUser(WBC, wbc, username, Callback) {
        var Match;
        if (!WBC.Canceled) {
            if (WBC.CC.checked) {
                wbc = null;
            }
            if (!wbc) {
                wbc = {
                    lastCheck: 0,
                    timestamp: 0
                };
            }
            if (((Date.now() - wbc.lastCheck) > 86400000) || WBC.Update) {
                if ((WBC.FC.checked && wbc.whitelistGiveaway) || (!WBC.FC.checked && wbc.giveaway)) {
                    WBC.Timestamp = wbc.timestamp;
                    checkWBCGiveaway(WBC, wbc, Callback);
                } else {
                    WBC.Timestamp = 0;
                    WBC.GroupGiveaways = [];
                    Match = window.location.href.match(new RegExp("\/user\/" + username + "(\/search\?page=(\d+))?"));
                    getWBCGiveaways(WBC, wbc, username, 1, Match ? (Match[2] ? parseInt(Match[2]) : 1) : 0, "/user/" + username + "/search?page=", Callback);
                }
            } else {
                Callback(wbc);
            }
        }
    }

    function checkWBCGiveaway(WBC, wbc, Callback) {
        if (!WBC.Canceled) {
            queueRequest(WBC, null, wbc.whitelistGiveaway || wbc.giveaway, function (Response) {
                var responseHtml = DOM.parse(Response.responseText);
                var errorMessage = responseHtml.getElementsByClassName(`table--summary`)[0];
                var stop;
                if (errorMessage) {
                    errorMessage = errorMessage.textContent;
                    if (errorMessage.match(/blacklisted the giveaway creator/)) {
                        wbc.result = "notBlacklisted";
                        stop = true;
                    } else if (errorMessage.match(/blacklisted by the giveaway creator/)) {
                        wbc.result = "blacklisted";
                    } else if (errorMessage.match(/not a member of the giveaway creator's whitelist/)) {
                        wbc.result = "none";
                    } else {
                        wbc.result = "notBlacklisted";
                    }
                } else if (wbc.whitelistGiveaway) {
                    wbc.result = "whitelisted";
                } else {
                    wbc.result = "notBlacklisted";
                }
                wbc.lastCheck = Date.now();
                wbc.timestamp = WBC.Timestamp;
                Callback(wbc, stop);
            });
        }
    }

    function getWBCGiveaways(WBC, wbc, username, NextPage, CurrentPage, URL, Callback, Context) {
        var Giveaway, Pagination;
        if (Context) {
            if (!wbc.giveaway) {
                Giveaway = Context.querySelector("[class='giveaway__heading__name'][href*='/giveaway/']");
                wbc.giveaway = Giveaway ? Giveaway.getAttribute("href") : null;
            }
            Pagination = Context.getElementsByClassName("pagination__navigation")[0];
            Giveaway = Context.getElementsByClassName("giveaway__summary")[0];
            if (Giveaway && (WBC.Timestamp === 0)) {
                WBC.Timestamp = parseInt(Giveaway.querySelector("[data-timestamp]").getAttribute("data-timestamp"));
                if (WBC.Timestamp >= (new Date().getTime())) {
                    WBC.Timestamp = 0;
                }
            }
            if (wbc.giveaway) {
                checkWBCGiveaway(WBC, wbc, function (wbc, stop) {
                    var WhitelistGiveaways, I, N, GroupGiveaway;
                    if ((wbc.result === `notBlacklisted`) && !stop && WBC.FC.checked) {
                        WhitelistGiveaways = Context.getElementsByClassName("giveaway__column--whitelist");
                        for (I = 0, N = WhitelistGiveaways.length; (I < N) && !wbc.whitelistGiveaway; ++I) {
                            GroupGiveaway = WhitelistGiveaways[I].parentElement.getElementsByClassName("giveaway__column--group")[0];
                            if (GroupGiveaway) {
                                WBC.GroupGiveaways.push(GroupGiveaway.getAttribute("href"));
                            } else {
                                wbc.whitelistGiveaway = WhitelistGiveaways[I].closest(".giveaway__summary").getElementsByClassName("giveaway__heading__name")[0].getAttribute("href");
                            }
                        }
                        if (wbc.whitelistGiveaway) {
                            checkWBCGiveaway(WBC, wbc, Callback);
                        } else if (((WBC.Timestamp >= wbc.timestamp) || (WBC.Timestamp === 0)) && Pagination && !Pagination.lastElementChild.classList.contains("is-selected")) {
                            window.setTimeout(getWBCGiveaways, 0, WBC, wbc, username, NextPage, CurrentPage, URL, Callback);
                        } else if ((wbc.groupGiveaways && wbc.groupGiveaways.length) || WBC.GroupGiveaways.length) {
                            getWBCGroupGiveaways(WBC, 0, WBC.GroupGiveaways.length, wbc, username, function (wbc, Result) {
                                var Groups, GroupGiveaways, Found, J, NumGroups;
                                if (Result) {
                                    Callback(wbc);
                                } else {
                                    Groups = GM_getValue("Groups");
                                    for (GroupGiveaway in wbc.groupGiveaways) {
                                        Found = false;
                                        GroupGiveaways = wbc.groupGiveaways[GroupGiveaway];
                                        for (I = 0, N = GroupGiveaways.length; (I < N) && !Found; ++I) {
                                            for (J = 0, NumGroups = Groups.length; (J < NumGroups) && (Groups[J].Code != GroupGiveaways[I]); ++J);
                                            if (J < NumGroups) {
                                                Found = true;
                                            }
                                        }
                                        if (!Found) {
                                            break;
                                        }
                                    }
                                    if (Found) {
                                        Callback(wbc);
                                    } else {
                                        wbc.result = "whitelisted";
                                        Callback(wbc);
                                    }
                                }
                            });
                        } else {
                            Callback(wbc);
                        }
                    } else {
                        Callback(wbc);
                    }
                });
            } else if (((WBC.Timestamp >= wbc.timestamp) || (WBC.Timestamp === 0)) && Pagination && !Pagination.lastElementChild.classList.contains("is-selected")) {
                window.setTimeout(getWBCGiveaways, 0, WBC, wbc, username, NextPage, CurrentPage, URL, Callback);
            } else {
                wbc.result = "unknown";
                wbc.lastCheck = Date.now();
                wbc.timestamp = WBC.Timestamp;
                Callback(wbc);
            }
        } else if (!WBC.Canceled) {
            WBC.Progress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>Retrieving " + username + "'s giveaways (page " + NextPage + ")...</span>";
            if (CurrentPage != NextPage) {
                queueRequest(WBC, null, URL + NextPage, function (Response) {
                    if (Response.finalUrl.match(/\/user\//)) {
                        window.setTimeout(getWBCGiveaways, 0, WBC, wbc, username, ++NextPage, CurrentPage, URL, Callback, DOM.parse(Response.responseText));
                    } else {
                        wbc.result = "unknown";
                        wbc.lastCheck = Date.now();
                        wbc.timestamp = WBC.Timestamp;
                        Callback(wbc);
                    }
                });
            } else {
                window.setTimeout(getWBCGiveaways, 0, WBC, wbc, username, ++NextPage, CurrentPage, URL, Callback, document);
            }
        }
    }

    function getWBCGroupGiveaways(WBC, I, N, wbc, username, Callback) {
        if (!WBC.Canceled) {
            if (I < N) {
                WBC.Progress.innerHTML =
                    "<i class=\"fa fa-circle-o-notch\"></i> " +
                    "<span>Retrieving " + username + "'s group giveaways (" + I + " of " + N + ")...</span>";
                getWBCGroups(WBC, WBC.GroupGiveaways[I] + "/search?page=", 1, wbc, function (wbc, Result) {
                    if (Result) {
                        Callback(wbc, Result);
                    } else {
                        window.setTimeout(getWBCGroupGiveaways, 0, WBC, ++I, N, wbc, username, Callback);
                    }
                });
            } else {
                Callback(wbc);
            }
        }
    }

    function getWBCGroups(WBC, URL, NextPage, wbc, Callback) {
        if (!WBC.Canceled) {
            queueRequest(WBC, null, URL + NextPage, function (Response) {
                var ResponseText, ResponseHTML, Groups, N, GroupGiveaway, I, Group, Pagination;
                ResponseText = Response.responseText;
                ResponseHTML = DOM.parse(ResponseText);
                Groups = ResponseHTML.getElementsByClassName("table__column__heading");
                N = Groups.length;
                if (N > 0) {
                    if (!wbc.groupGiveaways) {
                        wbc.groupGiveaways = {};
                    }
                    GroupGiveaway = URL.match(/\/giveaway\/(.+)\//)[1];
                    if (!wbc.groupGiveaways[GroupGiveaway]) {
                        wbc.groupGiveaways[GroupGiveaway] = [];
                    }
                    for (I = 0; I < N; ++I) {
                        Group = Groups[I].getAttribute("href").match(/\/group\/(.+)\//)[1];
                        if (wbc.groupGiveaways[GroupGiveaway].indexOf(Group) < 0) {
                            wbc.groupGiveaways[GroupGiveaway].push(Group);
                        }
                    }
                    Pagination = ResponseHTML.getElementsByClassName("pagination__navigation")[0];
                    if (Pagination && !Pagination.lastElementChild.classList.contains("is-selected")) {
                        window.setTimeout(getWBCGroups, 0, WBC, URL, ++NextPage, wbc, Callback);
                    } else {
                        Callback(wbc);
                    }
                } else {
                    var errorMessage = ResponseHTML.getElementsByClassName(`table--summary`)[0];
                    if (errorMessage && errorMessage.textContent.match(/not a member of the giveaway creator's whitelist/)) {
                        wbc.result = "none";
                        Callback(wbc, true);
                    } else {
                        Callback(wbc, true);
                    }
                }
            });
        }
    }

    function getWBCUsers(WBC, NextPage, CurrentPage, URL, Callback, Context) {
        var Matches, I, N, Match, Username, Pagination;
        if (Context) {
            Matches = Context.querySelectorAll("a[href*='/user/']");
            for (I = 0, N = Matches.length; I < N; ++I) {
                Match = Matches[I].getAttribute("href").match(/\/user\/(.+)/);
                if (Match) {
                    Username = Match[1];
                    if ((WBC.Users.indexOf(Username) < 0) && (Username != WBC.Username) && (Username == Matches[I].textContent) && !Matches[I].closest(".markdown")) {
                        WBC.Users.push(Username);
                    }
                }
            }
            Pagination = Context.getElementsByClassName("pagination__navigation")[0];
            if (Pagination && !Pagination.lastElementChild.classList.contains("is-selected")) {
                window.setTimeout(getWBCUsers, 0, WBC, NextPage, CurrentPage, URL, Callback);
            } else {
                Callback();
            }
        } else if (!WBC.Canceled) {
            WBC.Progress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>Retrieving users (page " + NextPage + ")...</span>";
            if (CurrentPage != NextPage) {
                queueRequest(WBC, null, URL + NextPage, function (Response) {
                    window.setTimeout(getWBCUsers, 0, WBC, ++NextPage, CurrentPage, URL, Callback, DOM.parse(Response.responseText));
                });
            } else {
                window.setTimeout(getWBCUsers, 0, WBC, ++NextPage, CurrentPage, URL, Callback, document);
            }
        }
    }

    function addWbcIcons() {
        var key;
        if (Object.keys(esgst.currentUsers).length) {
            var users = JSON.parse(GM_getValue(`users`));
            for (key in users.users) {
                var id = esgst.sg ? users.users[key].username : key;
                if (esgst.currentUsers[id]) {
                    addWBCIcon(users.users[key], esgst.currentUsers[id]);
                }
            }
        }
    }

    function addWBCIcon(user, Matches) {
        var Result, HTML, I, N, Context, Container;
        if (user.wbc) {
            Result = user.wbc.result;
            if ((Result == "whitelisted") || ((Result == "blacklisted") && esgst.wbc_b)) {
                HTML =
                    "<span class=\"sidebar__shortcut-inner-wrap WBCIcon rhWBIcon\" title=\"" + user.username + " has " + Result.toLowerCase() + " you (last checked " + getTimestamp(user.wbc.lastCheck / 1e3) + ")\">" +
                    "    <i class=\"fa sidebar__shortcut__" + ((Result == "whitelisted") ? "whitelist fa-check" : "blacklist fa-times") + " is-disabled is-selected\"" +
                    "    style=\"background: none !important;\"></i>" +
                    "</span>";
                for (I = 0, N = Matches.length; I < N; ++I) {
                    Context = Matches[I];
                    Container = Context.parentElement;
                    if (Container.classList.contains("comment__username")) {
                        Context = Container;
                    }
                    Context.insertAdjacentHTML("beforeBegin", HTML);
                }
            }
        }
    }

    /* Whitelist/Blacklist Highlighter */

    function loadWhitelistBlacklistHighlighter() {
        var key;
        if (Object.keys(esgst.currentUsers).length) {
            var users = JSON.parse(GM_getValue(`users`));
            for (key in users.users) {
                var id = esgst.sg ? users.users[key].username : key;
                if (esgst.currentUsers[id]) {
                    highlightWbhUser(users.users[key], esgst.currentUsers[id]);
                }
            }
        }
    }

    function highlightWbhUser(user, matches) {
        if (user.whitelisted || user.blacklisted) {
            var status, icon;
            if (user.whitelisted) {
                status = `whitelisted`;
                icon = `fa-heart sidebar__shortcut__whitelist`;
            } else {
                status = `blacklisted`;
                icon = `fa-ban sidebar__shortcut__blacklist`;
            }
            var title = `You ${status} ${user.username} on ${getTimestamp(user[`${status}Date`] / 1e3)}`, i, n, context;
            if ((user.whitelisted && esgst.wbh_cw) || (user.blacklisted && esgst.wbh_cb)) {
                for (i = 0, n = matches.length; i < n; ++i) {
                    context = matches[i];
                    context.classList.add(`esgst-wbh-highlight`, status);
                    context.title = title;
                }
            } else {
                var html = `
<span class="sidebar__shortcut-inner-wrap esgst-wbh-icon" title="${title}">
<i class="fa ${icon} is-disabled is-selected" style="background: none !important;"></i>
</span>
`;
                for (i = 0, n = matches.length; i < n; ++i) {
                    context = matches[i];
                    var container = context.parentElement;
                    if (container.classList.contains(`comment__username`)) {
                        context = container;
                    }
                    insertHtml(context, `beforeBegin`, html);
                }
            }
        }
    }

    /* Inbox Winners Highlighter */

    function loadInboxWinnersHighlighter(context) {
        var className;
        var callback;
        if (esgst.winnersPath) {
            className = `table__gift-not-sent`;
            callback = setIWHObserver;
        } else {
            className = `comments__entity`;
            callback = highlightIWHWinner;
        }
        var matches = context.getElementsByClassName(className);
        for (var i = 0, n = matches.length; i < n; ++i) {
            callback(matches[i]);
        }
    }

    function setIWHObserver(Context) {
        var Key, Username;
        Key = window.location.pathname.match(/\/giveaway\/(.+?)\//)[1];
        Username = Context.closest(".table__row-inner-wrap").getElementsByClassName("table__column__heading")[0].querySelector("a[href*='/user/']").textContent;
        Context.addEventListener("click", function () {
            var Winners;
            Winners = GM_getValue("Winners");
            if (!Winners[Key]) {
                Winners[Key] = [];
            }
            if (Winners[Key].indexOf(Username) < 0) {
                Winners[Key].push(Username);
            }
            GM_setValue("Winners", Winners);
        });
    }

    function highlightIWHWinner(Context) {
        var Match, Key, Winners, Matches, I, N, Username;
        Match = Context.firstElementChild.firstElementChild.getAttribute("href").match(/\/giveaway\/(.+?)\//);
        if (Match) {
            Key = Match[1];
            Winners = GM_getValue("Winners");
            if (Winners[Key]) {
                Matches = Context.nextElementSibling.children;
                for (I = 0, N = Matches.length; I < N; ++I) {
                    Context = Matches[I].getElementsByClassName("comment__username")[0];
                    Username = Context.textContent;
                    if (Winners[Key].indexOf(Username) >= 0) {
                        Context.insertAdjacentHTML("afterEnd", "<i class=\"fa fa-trophy IWHIcon\" title=\"This is the winner or one of the winners of this giveaway\"></i>");
                    }
                }
            }
        }
    }

    /* Groups Highlighter */

    function loadGroupsHighlighter(context) {
        var matches = context.querySelectorAll(`.table__column__heading[href*="/group/"]`);
        highlightGHGroups(matches);
    }

    function highlightGHGroups(Matches) {
        var I, N, Groups, Group, J, NumGroups;
        Groups = GM_getValue("Groups");
        for (I = 0, N = Matches.length; I < N; ++I) {
            Group = Matches[I].getAttribute("href").match(/\/group\/(.+)\//)[1];
            for (J = 0, NumGroups = Groups.length; (J < NumGroups) && (Groups[J].Code != Group); ++J);
            if (J < NumGroups) {
                Matches[I].closest(".table__row-outer-wrap").classList.add("GHHighlight");
            }
        }
    }

    /* Group Stats */

    function loadGroupsStats(context) {
        if (context == document) {
            addGSHeading();
        }
        var matches = document.getElementsByClassName(`table__row-inner-wrap`);
        for (var i = 0, n = matches.length; i < n; ++i) {
            loadGSStatus(matches[i]);
        }
    }

    function addGSHeading() {
        var Context;
        Context = document.getElementsByClassName("table__heading")[0];
        Context.insertAdjacentHTML(
            "beforeEnd",
            "<div class=\"table__column--width-small text-center\">Sent</div>" +
            "<div class=\"table__column--width-small text-center\">Received</div>" +
            "<div class=\"table__column--width-small text-center\">Gift Difference</div>" +
            "<div class=\"table__column--width-small text-center\">Value Difference</div>"
        );
    }

    function loadGSStatus(Context) {
        var GS, URL;
        Context.insertAdjacentHTML(
            "beforeEnd",
            "<div class=\"table__column--width-small text-center\">" +
            "    <i class=\"fa fa-circle-o-notch fa-spin\"></i>" +
            "    <span>Loading group stats...</span>" +
            "</div>"
        );
        GS = {
            Progress: Context.lastElementChild
        };
        URL = Context.getElementsByClassName("table__column__heading")[0].getAttribute("href") + "/users/search?q=" + GM_getValue("Username");
        queueRequest(GS, null, URL, function (Response) {
            var Matches, I, N;
            GS.Progress.remove();
            Matches = DOM.parse(Response.responseText).getElementsByClassName("table__row-inner-wrap")[0].getElementsByClassName("table__column--width-small");
            for (I = 0, N = Matches.length; I < N; ++I) {
                Context.appendChild(Matches[0]);
            }
        });
    }

    /*
     * Features - Games
     */

    function loadGameFeatures(context) {
        var games, i, n;
        games = getGames(context);
        for (i = 0, n = esgst.gameFeatures.length; i < n; ++i) {
            esgst.gameFeatures[i](games);
        }
    }

    function getGames(context) {
        var games, heading, headingName, name, i, id, info, match, matches, n, type;
        games = {
            apps: {},
            subs: {}
        };
        matches = context.querySelectorAll(`.featured__outer-wrap--giveaway, .giveaway__row-outer-wrap, .table__row-outer-wrap`);
        for (i = 0, n = matches.length; i < n; ++i) {
            match = matches[i];
            info = getGameInfo(match);
            heading = match.querySelector(`.featured__heading, .giveaway__heading, .table__column__heading`);
            if (info && heading) {
                headingName = heading.querySelector(`.featured__heading__medium, .giveaway__heading__name`) || heading;
                name = headingName.textContent;
                id = info.id;
                type = info.type;
                if (!games[type][id]) {
                    games[type][id] = [];
                }
                games[type][id].push({
                    container: match,
                    heading: heading,
                    headingName: headingName,
                    name: name
                });
            }
        }
        return games;
    }

    function getGameInfo(context, steamLink) {
        var info;
        steamLink = context.querySelector(`[href*="/app/"], [href*="/sub/"], [style*="/apps/"], [style*="/subs/"]`);
        if (steamLink) {
            var el = steamLink.getAttribute(`href`) || steamLink.getAttribute(`style`);
            if (el) {
                info = el.match(/\/(app|sub)s?\/(\d+)/);
                return {
                    type: `${info[1]}s`,
                    id: info[2]
                };
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    /* [EGH] Entered Games Highlighter */

    function loadEgh() {
        if (esgst.sg) {
            if (esgst.giveawayPath) {
                setEghObserver(document);
            }
            if (!esgst.menuPath) {
            esgst.gameFeatures.push(function (games) {
                var savedGames;
                savedGames = JSON.parse(GM_getValue(`games`));
                highlightEghGames(games.apps, savedGames.apps, `apps`);
                highlightEghGames(games.subs, savedGames.subs, `subs`);
            });
            }
        }
    }

    function setEghObserver(context) {
        var button, info;
        button = context.querySelector(`.sidebar__entry-insert`);
        if (button) {
            info = getGameInfo(context);
            if (info) {
                button.addEventListener(`click`, function () {
                    saveEghGame(info.id, info.type);
                });
            }
        }
    }

    function saveEghGame(id, type) {
        var games;
        if (id && type) {
            games = JSON.parse(GM_getValue(`games`));
            if (!games[type][id] || !games[type][id].entered) {
                createLock(`gameLock`, 300, function (deleteLock) {
                    games = JSON.parse(GM_getValue(`games`));
                    if (!games[type][id]) {
                        games[type][id] = {};
                    }
                    games[type][id].entered = true;
                    GM_setValue(`games`, JSON.stringify(games));
                    deleteLock();
                });
            }
        }
    }

    function highlightEghGames(games, savedGames, type) {
        var i, id, n;
        for (id in savedGames) {
            if (savedGames[id].entered && games[id]) {
                for (i = 0, n = games[id].length; i < n; ++i) {
                    if (!games[id][i].container.getElementsByClassName(`esgst-egh-button`)[0]) {
                        addEghIcon(games[id][i].headingName, id, type);
                    }
                }
            }
        }
    }

    function addEghIcon(headingName, id, type) {
        var icon;
        icon = insertHtml(headingName, `beforeBegin`, `
            <a class="esgst-egh-button">
                <i class="fa fa-star esgst-egh-icon" title="You have entered giveaways for this game before. Click to unhighlight it"></i>
            </a>
        `);
        icon.addEventListener(`click`, unhighlightGame);

        function unhighlightGame() {
            icon.removeEventListener(`click`, unhighlightGame);
            icon.innerHTML = `<i class="fa fa-circle-o-notch fa-spin"></i>`;
            createLock(`gameLock`, 300, function (deleteLock) {
                var games;
                games = JSON.parse(GM_getValue(`games`));
                delete games[type][id].entered;
                GM_setValue(`games`, JSON.stringify(games));
                icon.remove();
                deleteLock();
            });
        }
    }

    /* [GT] Game Tags */

    function loadGt() {
        var savedGames;
        if (esgst.sg) {
            esgst.gameFeatures.push(function (games) {
                savedGames = JSON.parse(GM_getValue(`games`));
                getGtGames(games.apps, savedGames.apps, `apps`);
                getGtGames(games.subs, savedGames.subs, `subs`);
            });
        }
    }

    function getGtGames(games, savedGames, type) {
        var i, id, n;
        for (id in games) {
            for (i = 0, n = games[id].length; i < n; ++i) {
                addGtPanel(games[id][i], id, type);
            }
        }
        for (id in savedGames) {
            if (savedGames[id].tags && games[id]) {
                addGtTags(id, savedGames[id].tags, type, games[id]);
            }
        }
    }

    function addGtPanel(context, id, type) {
        var games, input, popup, set;
        if (!context.container.getElementsByClassName(`esgst-gt-panel`)[0]) {
            insertHtml(context.heading.lastElementChild || context.heading, `afterEnd`, `
            <a class="esgst-gt-panel" title="Add game tags">
                <i class="fa fa-tag"></i>
                <span class="esgst-gt-tags"></span>
            </a>
        `).addEventListener(`click`, function () {
                    popup = createPopup_v6(`fa-tag`, `Edit game tags for <span>${context.name}</span>:`, true);
                    input = insertHtml(popup.description, `beforeEnd`, `
                <input type="text"/>
            `);
                    popup.description.insertAdjacentHTML(`beforeEnd`, createDescription(`Use commas to separate tags, for example: Tag1, Tag2, ...`));
                    set = createButtonSet(`green`, `grey`, `fa-check`, `fa-circle-o-notch fa-spin`, `Save`, `Saving...`, saveGtTags.bind(null, id, input, popup, type));
                    popup.description.appendChild(set.set);
                    input.addEventListener(`keydown`, function (event) {
                        if (event.key === `Enter`) {
                            set.toggle();
                            saveGtTags(id, input, popup, type, set.toggle);
                        }
                    });
                    popup.open(function () {
                        input.focus();
                        games = JSON.parse(GM_getValue(`games`));
                        if (games[type][id] && games[type][id].tags) {
                            input.value = (games[type][id].tags.join && games[type][id].tags.join(`, `)) || games[type][id].tags;
                        }
                    });
                });
        }
    }

    function saveGtTags(id, input, popup, type) {
        var games, tags;
        tags = input.value.replace(/(,\s*)+/g, function (match, p1, offset, string) {
            return (((offset === 0) || (offset == (string.length - match.length))) ? `` : `, `);
        }).split(`, `);
        createLock(`gameLock`, 300, function (closeLock) {
            games = JSON.parse(GM_getValue(`games`));
            if (!games[type][id]) {
                games[type][id] = {};
            }
            games[type][id].tags = tags;
            GM_setValue(`games`, JSON.stringify(games));
            addGtTags(id, tags, type);
            popup.opened.close();
            closeLock();
        });
    }

    function addGtTags(id, tags, type, games) {
        var html, i, n, prefix, suffix;
        prefix = `<span class=\"global__image-outer-wrap author_avatar is_icon\">`;
        suffix = `</span>`;
        html = tags.length ? tags.join(`, `).replace(/^|,\s|$/g, function (match, offset, string) {
            return ((offset === 0) ? prefix : ((offset == (string.length - match.length)) ? suffix : (`${suffix}${prefix}`)));
        }) : "";
        if (!games) {
            games = getGames(document)[type][id];
        }
        if (games) {
            for (i = 0, n = games.length; i < n; ++i) {
                games[i].container.getElementsByClassName(`esgst-gt-tags`)[0].innerHTML = html;
            }
        }
    }

    /* [GC] Game Categories */

    function loadGc() {
        if (esgst.sg) {
            if (esgst.newGiveawayPath) {
                if (esgst.gc_b && GM_getValue(`LastBundleSync`)) {
                    var table = document.getElementsByClassName(`js__autocomplete-data`)[0];
                    if (table) {
                        var backup = table.innerHTML;
                        var games = JSON.parse(GM_getValue(`games`));
                        window.setInterval(function () {
                            if (table.innerHTML && (backup != table.innerHTML)) {
                                var matches = table.getElementsByClassName(`table__column--width-fill`);
                                for (var i = 0, n = matches.length; i < n; ++i) {
                                    var info = getGameInfo(matches[i]);
                                    var id = info.id;
                                    var type = info.type;
                                    if (games[type][id] && ((esgst.gc_b_r && !games[type][id].bundled) || (!esgst.gc_b_r && games[type][id].bundled))) {
                                        var text;
                                        if (games[type][id].bundled) {
                                            text = `Bundled`;
                                        } else {
                                            text = `Not Bundled`;
                                        }
                                        if (!matches[i].parentElement.getElementsByClassName(`esgst-gc bundled`)[0]) {
                                            var html = `
<div class="nav__notification esgst-gc bundled">${text}</div>
`;
                                            matches[i].insertAdjacentHTML(`beforeEnd`, html);
                                        }
                                    }
                                }
                                backup = table.innerHTML;
                            }
                        }, 500);
                    }
                }
            } else if (!esgst.menuPath) {
                esgst.gameFeatures.push(function (games) {
                    getGcGames(games.apps, `apps`);
                    getGcGames(games.subs, `subs`);
                });
            }
        }
    }

    function getGcGames(games, type) {
        var i, id, ids, n;
        ids = Object.keys(games);
        for (id in games) {
            for (i = 0, n = games[id].length; i < n; ++i) {
                if (!games[id][i].container.getElementsByClassName(`esgst-gc-panel`)[0]) {
                    games[id][i].heading.insertAdjacentHTML(`afterEnd`, `<div class="esgst-gc-panel"></div>`);
                }
            }
        }
        addGcCategories(games, 0, ids, ids.length, type);
    }

    function addGcCategories(games, i, ids, n, type) {
        var id, savedGames, url;
        if (i < n) {
            savedGames = JSON.parse(GM_getValue(`games`));
            id = ids[i];
            if (!savedGames[type][id] || (typeof savedGames[type][id].lastCheck === `undefined`) || ((Date.now() - savedGames[type][id].lastCheck) > 604800000)) {
                url = (type === `apps`) ? `appdetails?appids` : `packagedetails?packageids`;
                request(null, false, `http://store.steampowered.com/api/${url}=${id}&cc=us`, function (response) {
                    if (esgst.gc_g_udt || esgst.gc_r) {
                        request(null, false, `http://store.steampowered.com/${type.slice(0, -1)}/${id}`, function (response2) {
                            getGcCategories(games, id, response, response2, type, function () {
                                window.setTimeout(addGcCategories, 0, games, ++i, ids, n, type);
                            });
                        });
                    } else {
                        getGcCategories(games, id, response, null, type, function () {
                            window.setTimeout(addGcCategories, 0, games, ++i, ids, n, type);
                        });
                    }
                });
            } else {
                addGcCategory(games[id], savedGames[type][id]);
                window.setTimeout(addGcCategories, 0, games, ++i, ids, n, type);
            }
        }
    }

    function getGcCategories(games, id, response, response2, type, callback) {
        createLock(`gameLock`, 300, function (deleteLock) {
            var appId, i, match, n, responseHtml, responseJson, savedGames, summary, summaries, tag, tags;
            responseJson = JSON.parse(response.responseText)[id];
            savedGames = JSON.parse(GM_getValue(`games`));
            if (!savedGames[type][id]) {
                savedGames[type][id] = {};
            }
            if (responseJson.success) {
                if (responseJson.data.type === `dlc`) {
                    savedGames[type][id].dlc = true;
                }
                if (responseJson.data.apps) {
                    if (!savedGames[type][id].apps) {
                        savedGames[type][id].apps = [];
                    }
                    for (i = 0, n = responseJson.data.apps.length; i < n; ++i) {
                        appId = responseJson.data.apps[i].id;
                        savedGames[type][id].apps.push(appId);
                        if (savedGames.apps[appId] && savedGames.apps[appId].wishlisted) {
                            savedGames[type][id].wishlisted = true;
                        }
                    }
                }
                if (responseJson.data.packages) {
                    savedGames[type][id].subs = responseJson.data.packages;
                    if (savedGames[type][id].wishlisted) {
                        for (i = 0, n = savedGames[type][id].subs.length; i < n; ++i) {
                            if (savedGames[type][savedGames[type][id].subs[i]]) {
                                savedGames[type][savedGames[type][id].subs[i]].wishlisted = true;
                            }
                        }
                    }
                }
                savedGames[type][id].linux = responseJson.data.platforms.linux;
                savedGames[type][id].mac = responseJson.data.platforms.mac;
                if (responseJson.data.categories) {
                    for (i = 0, n = responseJson.data.categories.length; i < n; ++i) {
                        if (responseJson.data.categories[i].description == `Steam Achievements`) {
                            savedGames[type][id].achievements = true;
                        } else if (responseJson.data.categories[i].description == `Steam Trading Cards`) {
                            savedGames[type][id].tradingCards = true;
                        } else if (responseJson.data.categories[i].description == `Multi-player`) {
                            savedGames[type][id].multiplayer = true;
                        } else if (responseJson.data.categories[i].description == `Steam Cloud`) {
                            savedGames[type][id].steamCloud = true;
                        }
                    }
                }
                if (responseJson.data.genres) {
                    savedGames[type][id].genres = [];
                    for (i = 0, n = responseJson.data.genres.length; i < n; ++i) {
                        savedGames[type][id].genres.push(responseJson.data.genres[i].description);
                    }
                }
            }
            if (response2) {
                responseHtml = DOM.parse(response2.responseText);
                tags = responseHtml.querySelectorAll(`a.app_tag`);
                n = tags.length;
                if (n > 0) {
                    if (!savedGames[type][id].genres) {
                        savedGames[type][id].genres = [];
                    }
                    for (i = 0; i < n; ++i) {
                        tag = tags[i].textContent.trim();
                        if (savedGames[type][id].genres.indexOf(tag) < 0) {
                            savedGames[type][id].genres.push(tag);
                        }
                    }
                }
                summaries = responseHtml.getElementsByClassName(`user_reviews_summary_row`);
                n = summaries.length;
                if (n > 0) {
                    summary = summaries[n - 1];
                    match = summary.getAttribute(`data-store-tooltip`).replace(/,/g, ``).match(/(\d+?)%.*?(\d+)/);
                    if (match) {
                        summary = summary.getElementsByClassName(`game_review_summary`)[0];
                        summary.classList.remove(`game_review_summary`);
                        savedGames[type][id].rating = {
                            count: `${match[1]}% (${match[2]} Reviews)`,
                            type: summary.className || `negative`
                        };
                        savedGames[type][id].genres.sort(function (a, b) {
                            return a.toLowerCase().localeCompare(b.toLowerCase());
                        });
                    }
                }
            }
            savedGames[type][id].lastCheck = Date.now();
            GM_setValue(`games`, JSON.stringify(savedGames));
            addGcCategory(games[id], savedGames[type][id]);
            deleteLock();
            callback();
        });
    }

    function addGcCategory(games, savedGames) {
        var categories, category, html, i, icon, j, n, numGames, panel, text, value;
        categories = [
            {
                id: `gc_r`,
                key: `rating`
            },
            {
                id: `gc_b`,
                key: `bundled`,
                name: `Bundled`,
                simplified: `B`,
                icon: `fa-recycle`
            },
            {
                id: `gc_b_r`,
                key: `bundled`,
                name: `Not Bundled`,
                simplified: `NB`,
                icon: `fa-fire`
            },
            {
                id: `gc_o`,
                key: `owned`,
                name: `Owned`,
                simplified: `O`,
                icon: `fa-folder`
            },
            {
                id: `gc_w`,
                key: `wishlisted`,
                name: `Wishlisted`,
                simplified: `W`,
                icon: `fa-heart`
            },
            {
                id: `gc_i`,
                key: `ignored`,
                name: `Ignored`,
                simplified: `I`,
                icon: `fa-ban`
            },
            {
                id: `gc_tc`,
                key: `tradingCards`,
                name: `Trading Cards`,
                simplified: `TC`,
                icon: `fa-clone`
            },
            {
                id: `gc_a`,
                key: `achievements`,
                name: `Achievements`,
                simplified: `A`,
                icon: `fa-trophy`
            },
            {
                id: `gc_mp`,
                key: `multiplayer`,
                name: `Multiplayer`,
                simplified: `MP`,
                icon: `fa-users`
            },
            {
                id: `gc_sc`,
                key: `steamCloud`,
                name: `Steam Cloud`,
                simplified: `SC`,
                icon: `fa-cloud`
            },
            {
                id: `gc_l`,
                key: `linux`,
                name: `Linux`,
                simplified: `L`,
                icon: `fa-linux`
            },
            {
                id: `gc_m`,
                key: `mac`,
                name: `Mac`,
                simplified: `M`,
                icon: `fa-apple`
            },
            {
                id: `gc_dlc`,
                key: `dlc`,
                name: `DLC`,
                simplified: `DLC`,
                icon: `fa-download`
            },
            {
                id: `gc_g`,
                key: `genres`,
                name: `Genres`
            }
        ];
        html = ``;
        for (i = 0, n = categories.length - 1; i <= n; ++i) {
            category = categories[i];
            if (esgst[category.id] && ((category.id == `gc_b` && esgst.newGiveawayPath) || !esgst.newGiveawayPath) && ((category.id == `gc_b` && !esgst.gc_b_r) || (category.id != `gc_b`))) {
                value = savedGames[category.key];
                if ((value && category.id != `gc_b_r`) || (!value && category.id == `gc_b_r` && esgst.gc_b)) {
                    if (category.key == `genres`) {
                        text = value.join(`, `);
                    } else if (category.key == `rating`) {
                        if (savedGames.rating.type === `positive`) {
                            icon = `fa-thumbs-up`;
                        } else if (savedGames.rating.type === `mixed`) {
                            icon = `fa-minus-circle`;
                        } else {
                            icon = `fa-thumbs-down`;
                        }
                        text = `<i class="fa ${icon}" title="${savedGames.rating.count}"></i>`;
                        category.key += ` ${savedGames.rating.type}`;
                    } else if (esgst.gc_s) {
                        if (esgst.gc_s_i && category.icon) {
                            text = `<i class="fa ${category.icon}" title="${category.name}"></i>`;
                        } else {
                            text = `<span title="${category.name}">${category.simplified}</span>`;
                        }
                    } else {
                        text = category.name;
                    }
                    html += `
                        <div class="nav__notification esgst-gc ${category.key}">${text}</div>
                    `;
                }
            }
        }
        for (j = 0, numGames = games.length; j < numGames; ++j) {
            panel = games[j].container.getElementsByClassName(`esgst-gc-panel`)[0];
            if (panel && !panel.innerHTML) {
                panel.innerHTML = html;
                if (esgst.gf.filteredCount) {
                    filterGfGiveaways();
                }
            }
        }
    }

    /* */

    function loadMultiTag() {
        if (Object.keys(esgst.currentUsers).length) {
            addMTContainer(esgst.mainPageHeading);
        }
    }

    function addMTContainer(Context, MT, SM) {
        var MTContainer, MTButton, MTBox, MTUsers, MTGames, MTAll, MTNone, MTInverse, MTUsersCheckbox, MTGamesCheckbox, Popup;
        if (!MT) {
            MT = {};
        }
        MT.UserCheckboxes = {};
        MT.GameCheckboxes = {};
        MT.UsersSelected = [];
        MT.GamesSelected = [];
        Context.insertAdjacentHTML(
            "afterBegin",
            "<div class=\"MTContainer" + (SM ? " rhHidden" : "") + "\">" +
            "    <a class=\"MTButton page_heading_btn\" title=\"Tag multiple users / games at the same times\">" +
            "        <i class=\"fa fa-tags\"></i>" +
            "    </a>" +
            "</div>"
        );
        MTContainer = Context.firstElementChild;
        MTButton = MTContainer.firstElementChild;
        MTBox = createPopout(MTContainer);
        MTBox.Popout.classList.add("MTBox");
        MTBox.customRule = function (Target) {
            return (!MTContainer.contains(Target) && !Target.closest(".MTUserCheckbox") && !Target.closest(".MTGameCheckbox"));
        };
        Context = SM ? SM.Popup.Options : MTBox.Popout;
        Context.innerHTML =
            "<div" + ((GM_getValue("PUT") && !SM) ? "" : " class=\"rhHidden\"") + "><span class=\"MTUsers\"></span> Enable selection for user tags.</div>" +
            "<div" + ((GM_getValue("GT") && !SM) ? "" : " class=\"rhHidden\"") + "><span class=\"MTGames\"></span> Enable selection for game tags.</div>" +
            "<div><i class=\"fa fa-check-square-o MTAll\"></i> Select all.</div>" +
            "<div><i class=\"fa fa-square-o\ MTNone\"></i> Select none.</div>" +
            "<div><i class=\"fa fa-minus-square-o MTInverse\"></i> Select inverse.</div>" +
            "<div><span class=\"MTCount\">0</span> selected.</div>" +
            "<div class=\"MTTag\"></div>";
        MTUsers = Context.getElementsByClassName("MTUsers")[0];
        MTGames = Context.getElementsByClassName("MTGames")[0];
        MTAll = Context.getElementsByClassName("MTAll")[0];
        MTNone = Context.getElementsByClassName("MTNone")[0];
        MTInverse = Context.getElementsByClassName("MTInverse")[0];
        MT.Count = Context.getElementsByClassName("MTCount")[0];
        MT.Tag = Context.getElementsByClassName("MTTag")[0];
        MTUsersCheckbox = createCheckbox(MTUsers);
        MTGamesCheckbox = createCheckbox(MTGames);
        setMTCheckboxes(MTUsers, MTUsersCheckbox.Checkbox, esgst.users, "User", "beforeBegin", "previousElementSibling", MT);
        setMTCheckboxes(MTGames, MTGamesCheckbox.Checkbox, esgst.games, "Game", "afterBegin", "firstElementChild", MT);
        setMTSelect(MTAll, MT, "check");
        setMTSelect(MTNone, MT, "uncheck");
        setMTSelect(MTInverse, MT, "toggle");
        MT.Tag.classList.add("rhHidden");
        Popup = createPopup();
        Popup.Icon.classList.add("fa-tags");
        Popup.TextInput.classList.remove("rhHidden");
        Popup.TextInput.insertAdjacentHTML(
            "afterEnd",
            createDescription(
                "Use commas to separate tags, for example: Tag1, Tag2, ...<br/><br/>" +
                "A [*] tag means that the selected users / games have individual tags (not shared between all of them). Removing the [*] tag will delete those individual tags."
            )
        );
        createButton(MT.Tag, "fa-tags", "Multi-Tag", "", "", function (Callback) {
            var Tags, Shared, I, N, UserID, User, SavedUser, SavedTags, J, NumTags, SavedTag, SavedGames, SavedGame, Game, Key, Individual;
            Callback();
            if (!MTButton.classList.contains("rhBusy")) {
                Popup.Title.textContent = "Multi-tag " + MT.UsersSelected.length + " users and " + MT.GamesSelected.length + " games:";
                Tags = {};
                MT.UserTags = {};
                Shared = [];
                for (I = 0, N = MT.UsersSelected.length; I < N; ++I) {
                    UserID = MT.UsersSelected[I];
                    User = {};
                    User[esgst.sg ? "Username" : "SteamID64"] = UserID;
                    SavedUser = getUser(User);
                    if (SavedUser && SavedUser.Tags) {
                        SavedTags = SavedUser.Tags.split(/,\s/);
                        Tags[UserID] = MT.UserTags[UserID] = SavedTags;
                        for (J = 0, NumTags = SavedTags.length; J < NumTags; ++J) {
                            SavedTag = SavedTags[J];
                            if (Shared.indexOf(SavedTag) < 0) {
                                Shared.push(SavedTag);
                            }
                        }
                    } else {
                        Tags[UserID] = MT.UserTags[UserID] = "";
                    }
                }
                SavedGames = GM_getValue("Games");
                MT.GameTags = {};
                for (I = 0, N = MT.GamesSelected.length; I < N; ++I) {
                    Game = MT.GamesSelected[I];
                    SavedGame = SavedGames[Game];
                    if (SavedGame && SavedGame.Tags) {
                        SavedTags = SavedGame.Tags.split(/,\s/);
                        Tags[Game] = MT.GameTags[Game] = SavedTags;
                        for (J = 0, NumTags = SavedTags.length; J < NumTags; ++J) {
                            SavedTag = SavedTags[J];
                            if (Shared.indexOf(SavedTag) < 0) {
                                Shared.push(SavedTag);
                            }
                        }
                    } else {
                        Tags[Game] = MT.GameTags[Game] = "";
                    }
                }
                for (Key in Tags) {
                    Shared = Shared.filter(function (N) {
                        if (Tags[Key].indexOf(N) >= 0) {
                            return true;
                        } else {
                            Individual = true;
                            return false;
                        }
                    });
                }
                for (Key in Tags) {
                    for (I = 0, N = Shared.length; I < N; ++I) {
                        J = Tags[Key].indexOf(Shared[I]);
                        if (J >= 0) {
                            Tags[Key].splice(J, 1);
                        }
                    }
                }
                Popup.TextInput.value = Shared.length ? (Shared.join(", ") + (Individual ? ", [*]" : "")) : (Individual ? "[*]" : "");
            }
            Popup.popUp(function () {
                Popup.TextInput.focus();
            });
        });
        createButton(Popup.Button, "fa-check", "Save", "fa-times-circle", "Cancel", function (Callback) {
            var Shared, I, Individual, Keys;
            MT.Canceled = false;
            MTButton.classList.add("rhBusy");
            Shared = Popup.TextInput.value.replace(/(,\s*)+/g, function (Match, P1, Offset, String) {
                return (((Offset === 0) || (Offset == (String.length - Match.length))) ? "" : ", ");
            }).split(", ");
            I = Shared.indexOf("[*]");
            if (I >= 0) {
                Shared.splice(I, 1);
                Individual = true;
            } else {
                Individual = false;
            }
            Shared = Shared.join(", ");
            Keys = Object.keys(MT.UserTags);
            saveMTUserTags(MT, 0, Keys.length, Keys, Individual, Shared, MT.UserTags, function () {
                Keys = Object.keys(MT.GameTags);
                saveMTGameTags(MT, 0, Keys.length, Keys, Individual, Shared, MT.GameTags, function () {
                    MTButton.classList.remove("rhBusy");
                    MT.Progress.innerHTML = MT.OverallProgress.innerHTML = "";
                    Callback();
                    Popup.Close.click();
                });
            });
        }, function () {
            clearInterval(MT.Request);
            clearInterval(MT.Save);
            MT.Canceled = true;
            setTimeout(function () {
                MT.Progress.innerHTML = MT.OverallProgress.innerHTML = "";
            }, 500);
            MTButton.classList.remove("rhBusy");
        });
        MT.Progress = Popup.Progress;
        MT.OverallProgress = Popup.OverallProgress;
        MTButton.addEventListener("click", function () {
            if (MTBox.Popout.classList.contains("rhHidden")) {
                MTBox.popOut(MTContainer);
            } else {
                MTBox.Popout.classList.add("rhHidden");
            }
        });
    }

    function setMTCheckboxes(Element, Checkbox, Selection, Type, InsertionPosition, Position, MT) {
        Element.addEventListener("click", function () {
            if (Checkbox.checked) {
                addMTCheckboxes(Selection, Type, InsertionPosition, Position, MT);
            } else {
                removeMTCheckboxes(Type, MT);
            }
        });
    }

    function addMTCheckboxes(Selection, Type, InsertionPosition, Position, MT) {
        var Key, Matches, I, N, Context, MTCheckbox;
        for (Key in Selection) {
            Matches = Selection[Key];
            for (I = 0, N = Matches.length; I < N; ++I) {
                Context = Matches[I];
                Context.insertAdjacentHTML(InsertionPosition, "<span class=\"MT" + Type + "Checkbox\"></span>");
                MTCheckbox = createCheckbox(Context[Position]);
                if (!MT[Type + "Checkboxes"][Key]) {
                    MT[Type + "Checkboxes"][Key] = [];
                }
                MT[Type + "Checkboxes"][Key].push(MTCheckbox);
                setMTCheckbox(Type, Context[Position], MT, Key, MTCheckbox.Checkbox, MT.Tag);
            }
        }
    }

    function setMTCheckbox(Type, Context, MT, Key, Checkbox) {
        Context.addEventListener("click", function () {
            checkMTCheckbox(MT, Type, Key, Checkbox);
        });
    }

    function checkMTCheckbox(MT, Type, Key, Checkbox) {
        var Count, I, Checkboxes, N;
        Count = parseInt(MT.Count.textContent);
        I = MT[Type + "sSelected"].indexOf(Key);
        if (Checkbox.checked) {
            MT.Count.textContent = ++Count;
            if (I < 0) {
                MT[Type + "sSelected"].push(Key);
            }
        } else {
            MT.Count.textContent = --Count;
            if (I >= 0) {
                MT[Type + "sSelected"].splice(I, 1);
            }
        }
        Checkboxes = MT[Type + "Checkboxes"][Key];
        for (I = 0, N = Checkboxes.length; I < N; ++I) {
            if (Checkboxes[I].Checkbox != Checkbox) {
                Checkboxes[I].toggle();
            }
        }
        MT.Tag.classList[(Count > 1) ? "remove" : "add"]("rhHidden");
    }

    function removeMTCheckboxes(Type, MT) {
        var Matches, I, N;
        Matches = document.getElementsByClassName("MT" + Type + "Checkbox");
        for (I = 0, N = Matches.length; I < N; ++I) {
            Matches[0].remove();
        }
        MT[Type + "Checkboxes"] = {};
        MT[Type + "sSelected"] = [];
    }

    function setMTSelect(Element, MT, Call) {
        Element.addEventListener("click", function () {
            selectMTCheckboxes(MT.UserCheckboxes, Call, MT, "User");
            selectMTCheckboxes(MT.GameCheckboxes, Call, MT, "Game");
        });
    }

    function selectMTCheckboxes(MTCheckboxes, Call, MT, Type) {
        var Key, Checkbox, Previous, Current;
        for (Key in MTCheckboxes) {
            Checkbox = MTCheckboxes[Key][0];
            Previous = Checkbox.Checkbox.checked;
            Checkbox[Call]();
            Current = Checkbox.Checkbox.checked;
            if (Previous != Current) {
                checkMTCheckbox(MT, Type, Key, Checkbox.Checkbox);
            }
        }
    }

    function saveMTUserTags(MT, I, N, Keys, Individual, Shared, Tags, Callback) {
        var UserID, User;
        if (!MT.Canceled) {
            MT.OverallProgress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>" + I + " of " + N + " users tagged...</span>";
            if (I < N) {
                UserID = Keys[I];
                User = {
                    Tags: Individual ? (Shared + ", " + Tags[UserID]) : Shared
                };
                User[esgst.sg ? "Username" : "SteamID64"] = UserID;
                queueSave(MT, function () {
                    saveUser(User, MT, function () {
                        GM_setValue("LastSave", 0);
                        addPUTTags(UserID, getUser(User).Tags);
                        setTimeout(saveMTUserTags, 0, MT, ++I, N, Keys, Individual, Shared, Tags, Callback);
                    });
                });
            } else {
                Callback();
            }
        }
    }

    function saveMTGameTags(MT, I, N, Keys, Individual, Shared, Tags, Callback) {
        var Game, SavedGames;
        if (!MT.Canceled) {
            MT.OverallProgress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>" + I + " of " + N + " groups tagged...</span>";
            if (I < N) {
                Game = Keys[I];
                SavedGames = GM_getValue("Games");
                if (!SavedGames[Game]) {
                    SavedGames[Game] = {};
                }
                SavedGames[Game].Tags = Individual ? (Shared + ", " + Tags[Game]) : Shared;
                GM_setValue("Games", SavedGames);
                addGTTags(Game, SavedGames[Game].Tags);
                setTimeout(saveMTGameTags, 0, MT, ++I, N, Keys, Individual, Shared, Tags, Callback);
            } else {
                Callback();
            }
        }
    }

    function loadHeaderButton() {
        var html = `
<div class="nav__button-container nav_btn_container">
<div class="nav__relative-dropdown dropdown ${esgst.hiddenClass}">
<div class="nav__absolute-dropdown">
<div class="nav__row dropdown_btn esgst-hb-update">
<i class="icon-blue blue fa fa-fw fa-refresh"></i>
<div class="nav__row__summary">
<p class="nav__row__summary__name">Update</p>
${esgst.sg ? `
<p class="nav__row__summary__description">Check for updates.</p>
` : ``}
</div>
</div>
${esgst.uh ? `
<div class="nav__row dropdown_btn SMRecentUsernameChanges">
<i class="icon-red red fa fa-fw fa-user"></i>
<div class="nav__row__summary">
<p class="nav__row__summary__name">Recent Username Changes</p>
${esgst.sg ? `
<p class="nav__row__summary__description">Check out the recent username changes.</p>
` : ``}
</div>
</div>
` : ``}
${esgst.ch ? `
<div class="nav__row dropdown_btn SMCommentHistory">
<i class="icon-yellow yellow fa fa-fw fa-comments"></i>
<div class="nav__row__summary">
<p class="nav__row__summary__name">Comment History</p>
${esgst.sg ? `
<p class="nav__row__summary__description">Check out your comment history.</p>
` : ``}
</div>
</div>
` : ``}
<div class="nav__row dropdown_btn esgst-hb-changelog">
<i class="icon-grey grey fa fa-fw fa-file-text-o"></i>
<div class="nav__row__summary">
<p class="nav__row__summary__name">Changelog</p>
${esgst.sg ? `
<p class="nav__row__summary__description">View changelog.</p>
` : ``}
</div>
</div>
</div>
</div>
<a class="nav__button nav__button--is-dropdown nav_btn nav_btn_left" href="https://www.steamgifts.com/account#ESGST">
<i class="fa"><img src="${GM_getResourceURL(`esgstIcon`)}"/></i>
<span>Hax Script Settings</span>
</a>
<div class="nav__button nav__button--is-dropdown-arrow nav_btn nav_btn_right nav_btn_dropdown">
<i class="fa fa-angle-down"></i>
</div>
</div>
`;
        var className, insertPosition, getPosition;
        if (esgst.sg) {
            className = `nav__left-container`;
            insertPosition = `beforeEnd`;
            getPosition = `lastElementChild`;
        } else {
            className = `nav_logo`;
            insertPosition = `afterEnd`;
            getPosition = `nextElementSibling`;
        }
        var context = document.getElementsByClassName(className)[0];
        context.insertAdjacentHTML(insertPosition, html);
        var menu = context[getPosition];
        var SMRecentUsernameChanges = menu.getElementsByClassName("SMRecentUsernameChanges")[0];
        var SMCommentHistory = menu.getElementsByClassName("SMCommentHistory")[0];
        var SMCheckUpdate = menu.getElementsByClassName("esgst-hb-update")[0];
        var SMChangelog = menu.getElementsByClassName("esgst-hb-changelog")[0];
        if (SMRecentUsernameChanges) {
            setSMRecentUsernameChanges(SMRecentUsernameChanges);
        }
        if (SMCommentHistory) {
            setSMCommentHistory(SMCommentHistory);
        }
        var button = menu.lastElementChild;
        button.addEventListener(`click`, toggleHeaderButton);
        SMChangelog.addEventListener(`click`, function () {
            makeRequest(null, `https://raw.githubusercontent.com/gimmedemmaps/keks/master/changelog.txt`, null, function (response) {
                var changelogPopup = createPopup();
                changelogPopup.Icon.classList.add(`fa-file-text-o`);
                changelogPopup.Title.textContent = `Changelog`;
                var html = response.responseText.replace(/\/\*\n\s\*(.+)\n\s\*\//g, function (m, p1) {
                    return `<strong>${p1}</strong>`;
                }).replace(/\* (.+)/g, function (m, p1) {
                    return `<li>${p1}</li>`;
                }).replace(/\n/g, `<br/>`).replace(/#(\d+)/g, function (m, p1) {
                    return `<a href="https://github.com/revilheart/ESGST/issues/${p1}">#${p1}</a>`;
                });
                changelogPopup.Description.insertAdjacentHTML(`afterBegin`, html);
                changelogPopup.Description.classList.add(`left`);
                changelogPopup.popUp();
            });
        });
        SMCheckUpdate.addEventListener(`click`, function () {
            makeRequest(null, `https://www.dropbox.com/s/1oefnfdk0jycpmw/STRmods-ESGST.meta.js`, null, function (response) {
                var version = response.responseText.match(/@version (.+)/);
                if (version) {
                    if (version[1] != GM_info.script.version) {
                        window.location.href = `https://www.dropbox.com/s/fvn2fkes97thlr3/STRmods-ESGST.user.js?dl=1`;
                    } else {
                        window.alert(`No STRmods' ESGST updates found!`);
                    }
                } else {
                    window.alert(`No STRmods' ESGST updates found!`);
                }
            });
        });

        function toggleHeaderButton(e) {
            if (esgst.sg) {
                $("nav .nav__button").removeClass("is-selected");
                $("nav .nav__relative-dropdown").addClass("is-hidden");
                $(e.currentTarget).addClass("is-selected").siblings(".nav__relative-dropdown").removeClass("is-hidden");
                e.stopPropagation();
            } else {
                $(".nav_btn_dropdown").removeClass("is_selected");
                $(".page_heading_btn_dropdown").removeClass("is_selected");
                $(".dropdown").addClass("is_hidden");
                $(e.currentTarget).addClass("is_selected").siblings(".dropdown").removeClass("is_hidden");
                e.stopPropagation();
            }
        }
    }

    function loadGiveawayEncrypterDecrypter() {
        var context = document.getElementsByClassName(`nav__left-container`)[0];
        var html = `
<div class="nav__button-container esgst-hidden">
<div class="nav__button">
<i class="fa fa-star"></i>
</div>
</div>
`;
        context.insertAdjacentHTML(`beforeEnd`, html);
        esgst.ged = {};
        esgst.ged.button = context.lastElementChild;
        esgst.ged.popup = createPopup();
        esgst.ged.popup.Icon.classList.add(`fa-star`);
        esgst.ged.popup.Title.textContent = `Decrypted Giveaways`;
        esgst.ged.button.addEventListener(`click`, function () {
            esgst.ged.popup.popUp();
        });
        getEncryptedGiveaways(document);
        esgst.endlessFeatures.push(getEncryptedGiveaways);
    }

    function getEncryptedGiveaways(context) {
        var matches = context.querySelectorAll(`[href^="ESGST-"]`);
        var n = matches.length;
        if (n > 0) {
            esgst.ged.open = false;
            esgst.ged.giveaways = GM_getValue(`decryptedGiveaways`, GM_getValue(`exclusiveGiveaways`, {}));
            if (typeof esgst.ged.giveaways === `string`) {
                esgst.ged.giveaways = JSON.parse(esgst.ged.giveaways);
            }
            getEncryptedGiveaway(0, n, matches);
        }
    }

    function getEncryptedGiveaway(i, n, matches) {
        if (i < n) {
            var context = matches[i];
            var code = context.getAttribute(`href`).match(/ESGST-(.+)/)[1];
            var id = decryptGiveaway(code);
            var giveaway = esgst.ged.giveaways[id];
            var html = `
<a class="esgst-ged-icon" href="/giveaway/${id}/" title="ESGST Decrypted Giveaway">
<i class="fa fa-star"></i>
</a>
`;
            if (Date.now() <= ((giveaway && giveaway.timestamp) || Date.now())) {
                makeRequest(null, `/giveaway/${id}/`, esgst.ged.popup.Progress, function (response) {
                    var responseHtml = DOM.parse(response.responseText);
                    var container = responseHtml.getElementsByClassName(`featured__outer-wrap--giveaway`)[0];
                    if (container) {
                        var heading = responseHtml.getElementsByClassName(`featured__heading`)[0];
                        var columns = heading.nextElementSibling;
                        var remaining = columns.firstElementChild;
                        var timestamp = parseInt(remaining.lastElementChild.getAttribute(`data-timestamp`)) * 1000;
                        if (Date.now() < timestamp) {
                            var url = response.finalUrl;
                            var gameId = container.getAttribute(`data-game-id`);
                            var anchors = heading.getElementsByTagName(`a`);
                            var j, numA, numT;
                            for (j = 0, numA = anchors.length; j < numA; ++j) {
                                anchors[j].classList.add(`giveaway__icon`);
                            }
                            var hideButton = heading.getElementsByClassName(`featured__giveaway__hide`)[0];
                            if (hideButton) {
                                hideButton.remove();
                            }
                            var headingName = heading.firstElementChild;
                            headingName.outerHTML = `<a class="giveaway__heading__name" href="${url}">${headingName.innerHTML}</a>`;
                            var thinHeadings = heading.getElementsByClassName(`featured__heading__small`);
                            for (j = 0, numT = thinHeadings.length; j < numT; ++j) {
                                thinHeadings[0].outerHTML = `<span class="giveaway__heading__thin">${thinHeadings[0].innerHTML}</span>`;
                            }
                            remaining.classList.remove(`featured__column`);
                            var created = remaining.nextElementSibling;
                            created.classList.remove(`featured__column`, `featured__column--width-fill`);
                            created.classList.add(`giveaway__column--width-fill`);
                            created.lastElementChild.classList.add(`giveaway__username`);
                            var avatar = columns.lastElementChild;
                            avatar.remove();
                            var element = created.nextElementSibling;
                            while (element) {
                                element.classList.remove(`featured__column`);
                                element.className = element.className.replace(/featured/g, `giveaway`);
                                element = element.nextElementSibling;
                            }
                            var counts = responseHtml.getElementsByClassName(`sidebar__navigation__item__count`);
                            var image = responseHtml.getElementsByClassName(`global__image-outer-wrap--game-large`)[0].firstElementChild.getAttribute(`src`);
                            var popupHtml = `
<div><div class="giveaway__row-outer-wrap" data-game-id="${gameId}">
<div class="giveaway__row-inner-wrap">
<div class="giveaway__summary">
<h2 class="giveaway__heading">
${heading.innerHTML}
</h2>
<div class="giveaway__columns">
${columns.innerHTML}
</div>
<div class="giveaway__links">
<a href="${url}/entries">
<i class="fa fa-tag"></i>
<span>${counts[1].textContent} entries</span>
</a>
<a href="${url}/comments">
<i class="fa fa-comment"></i>
<span>${counts[0].textContent} comments</span>
</a>
</div>
</div>
${avatar.outerHTML}
<a class="global__image-outer-wrap global__image-outer-wrap--game-medium" href="${url}">
<div class="global__image-inner-wrap" style="background-image:url(${image});"></div>
</a>
</div>
</div></div>
`;
                            esgst.ged.popup.Results.insertAdjacentHTML(`beforeEnd`, popupHtml);
                            esgst.ged.popup.Results.lastElementChild.getElementsByClassName(`giveaway__heading__name`)[0].insertAdjacentText(`afterBegin`, `[NEW] `);
                            loadEndlessFeatures(esgst.ged.popup.Results.lastElementChild);
                            if (!esgst.giveawaysPath && !esgst.userPath && !esgst.giveawayPath && !esgst.enteredPath) {
                                loadGiveawayFeatures(esgst.ged.popup.Results.lastElementChild);
                            }
                            esgst.ged.open = true;
                            var comment = context.closest(`.comment`);
                            if (comment) {
                                var actions = comment.getElementsByClassName(`comment__actions`)[0];
                                actions.insertAdjacentHTML(`beforeEnd`, html);
                            }
                            esgst.ged.giveaways[id] = {
                                timestamp: timestamp
                            };
                            window.setTimeout(getEncryptedGiveaway, 0, ++i, n, matches);
                        } else {
                            esgst.ged.giveaways[id] = {
                                timestamp: timestamp
                            };
                            window.setTimeout(getEncryptedGiveaway, 0, ++i, n, matches);
                        }
                    } else {
                        window.setTimeout(getEncryptedGiveaway, 0, ++i, n, matches);
                    }
                });
            } else {
                window.setTimeout(getEncryptedGiveaway, 0, ++i, n, matches);
            }
        } else {
            GM_setValue(`decryptedGiveaways`, JSON.stringify(esgst.ged.giveaways));
            esgst.ged.popup.Description.classList.add(`left`);
            if (esgst.ged.open) {
                esgst.ged.button.classList.remove(`esgst-hidden`);
            }
        }
    }

    function decryptGiveaway(code) {
        var decodedCode = ``;
        var separatedCode = code.split(`-`);
        for (var i = 0, n = separatedCode.length; i < n; ++i) {
            decodedCode += String.fromCharCode(parseInt(separatedCode[i], 16));
        }
        return rot(decodedCode, 13);
    }

    function encryptGiveaway(code) {
        var rotatedCode = rot(code, 13);
        var encodedCode = [];
        for (var i = 0, n = rotatedCode.length; i < n; ++i) {
            encodedCode.push(rotatedCode.charCodeAt(i).toString(16));
        }
        return encodedCode.join(`-`);
    }

    function rot(string, n) {
        return string.replace(/[a-zA-Z]/g, function (char) {
            return String.fromCharCode(((char <= `Z`) ? 90 : 122) >= ((char = char.charCodeAt(0) + n)) ? char : (char - 26));
        });
    }

    function addSMButton() {
        var Sidebar, SMButton;
        Sidebar = document.getElementsByClassName("sidebar")[0];
        Sidebar.insertAdjacentHTML("beforeEnd", createNavigationSection("ESGST", [{
            Name: "SMButton",
            Title: "Settings",
            URL: "#ESGST"
        }, {
            Title: "Update",
            URL: "https://github.com/revilheart/ESGST/raw/master/ESGST.user.js"
        }, {
            Title: "GitHub",
            URL: "https://github.com/revilheart/ESGST"
        }, {
            Title: "Discussion",
            URL: "/discussion/TDyzv/"
        }]));
        SMButton = Sidebar.getElementsByClassName("SMButton")[0];
        SMButton.addEventListener("click", function () {
            window.location.hash = "ESGST";
            window.location.reload();
        });
        if (esgst.menuPath) {
            loadSMMenu(Sidebar, SMButton);
        }
    }

    function loadSMMenu(Sidebar, SMButton) {
        var Selected, Item, SMSyncFrequency, I, Container, SMGeneral, SMGiveaways, SMDiscussions, SMCommenting, SMUsers, SMOthers, SMManageData, SMManageFilteredUsers, SMRecentUsernameChanges,
            SMCommentHistory, SMManageTags, SMGeneralFeatures, SMGiveawayFeatures, SMDiscussionFeatures, SMCommentingFeatures, SMUserGroupGamesFeatures, SMOtherFeatures,
            SMLastSync, LastSync, SMAPIKey, SMLastBundleSync, LastBundleSync;
        Selected = Sidebar.getElementsByClassName("is-selected")[0];
        Selected.classList.remove("is-selected");
        SMButton.classList.add("is-selected");
        Item = SMButton.getElementsByClassName("sidebar__navigation__item__link")[0];
        Item.insertBefore(Selected.getElementsByClassName("fa")[0], Item.firstElementChild);
        SMSyncFrequency = "<select class=\"SMSyncFrequency\">";
        for (I = 0; I <= 30; ++I) {
            SMSyncFrequency += "<option>" + I + "</option>";
        }
        SMSyncFrequency += "</select>";
        Container = Sidebar.nextElementSibling;
        Container.innerHTML =
            "<div class=\"page__heading\">" +
            "    <div class=\"page__heading__breadcrumbs\">" +
            "        <a href=\"/account\">Account</a>" +
            "        <i class=\"fa fa-angle-right\"></i>" +
            "        <a href=\"#ESGST\">Enhanced SteamGifts & SteamTrades</a>" +
            "    </div>" +
            "</div>" +
            "<div class=\"form__rows SMMenu\">" +
            createSMSections([{
                Title: "General",
                Name: "SMGeneral"
            }, {
                Title: "Giveaways",
                Name: "SMGiveaways"
            }, {
                Title: "Discussions",
                Name: "SMDiscussions"
            }, {
                Title: "Commenting",
                Name: "SMCommenting"
            }, {
                Title: "Users, Groups & Games",
                Name: "SMUsers"
            }, {
                Title: "Others",
                Name: "SMOthers"
            }, {
                Title: "Sync Groups / Whitelist / Blacklist / Wishlist / Owned Games / Ignored Games",
                HTML: SMSyncFrequency + createDescription("Select from how many days to how many days you want the automatic sync to run (0 to disable it).") + (
                    "<div class=\"form__sync\">" +
                    "    <div class=\"form__sync-data\">" +
                    "        <div class=\"notification notification--warning SMLastSync\">" +
                    "            <i class=\"fa fa-question-circle\"></i> Never synced." +
                    "        </div>" +
                    "    </div>" +
                    "    <div class=\"form__submit-button SMSync\">" +
                    "        <i class=\"fa fa-refresh\"></i> Sync" +
                    "    </div>" +
                    "</div>"
                )
            },
            {
                Title: "Sync Bundle List",
                HTML: (
                    "<div class=\"form__sync\">" +
                    "    <div class=\"form__sync-data\">" +
                    "        <div class=\"notification notification--warning SMLastBundleSync\">" +
                    "            <i class=\"fa fa-question-circle\"></i> Never synced." +
                    "        </div>" +
                    "    </div>" +
                    "    <div class=\"form__submit-button SMBundleSync\">" +
                    "        <i class=\"fa fa-refresh\"></i> Sync" +
                    "    </div>" +
                    "</div>"
                )
            }, {
                Title: "Steam API Key",
                HTML: "<input class=\"SMAPIKey\" type=\"text\"/>" +
                createDescription("This is optional for Entries Remover (syncs new games faster). " +
                    "Get a Steam API Key <a class=\"rhBold\" href=\"https://steamcommunity.com/dev/apikey\" target=\"_blank\">here</a>.")
            }]) +
            "</div>";
        createSMButtons([{
            Check: true,
            Icons: ["fa-arrow-circle-up", "fa-arrow-circle-down", "fa-trash"],
            Name: "SMManageData",
            Title: "Manage data."
        }, {
            Check: esgst.uf,
            Icons: ["fa-user", "fa-eye-slash"],
            Name: "SMManageFilteredUsers",
            Title: "See list of filtered users."
        }, {
            Check: esgst.uh,
            Icons: ["fa-user"],
            Name: "SMRecentUsernameChanges",
            Title: "See recent username changes."
        }, {
            Check: esgst.ch,
            Icons: ["fa-comments"],
            Name: "SMCommentHistory",
            Title: "See comment history."
        }, {
            Check: false,
            Icons: ["fa-tags", "fa-cog"],
            Name: "SMManageTags",
            Title: "Manage tags."
        }, {
            Check: esgst.wbc,
            Icons: ["fa-heart", "fa-ban", "fa-cog"],
            Name: "WBCButton",
            Title: "Manage Whitelist / Blacklist Checker caches."
        }, {
            Check: esgst.namwc,
            Icons: ["fa-trophy", "fa-cog"],
            Name: "NAMWCButton",
            Title: "Manage Not Activated / Multiple Wins Checker caches."
        }]);
        esgst.mainPageHeading = Container.getElementsByClassName(`page__heading`)[0];
        SMGeneral = Container.getElementsByClassName("SMGeneral")[0];
        SMGiveaways = Container.getElementsByClassName("SMGiveaways")[0];
        SMDiscussions = Container.getElementsByClassName("SMDiscussions")[0];
        SMCommenting = Container.getElementsByClassName("SMCommenting")[0];
        SMUsers = Container.getElementsByClassName("SMUsers")[0];
        SMOthers = Container.getElementsByClassName("SMOthers")[0];
        SMManageData = Container.getElementsByClassName("SMManageData")[0];
        SMRecentUsernameChanges = Container.getElementsByClassName("SMRecentUsernameChanges")[0];
        SMManageFilteredUsers = Container.getElementsByClassName("SMManageFilteredUsers")[0];
        SMCommentHistory = Container.getElementsByClassName("SMCommentHistory")[0];
        SMManageTags = Container.getElementsByClassName("SMManageTags")[0];
        SMSyncFrequency = Container.getElementsByClassName("SMSyncFrequency")[0];
        SMLastSync = Container.getElementsByClassName("SMLastSync")[0];
        SMLastBundleSync = Container.getElementsByClassName("SMLastBundleSync")[0];
        SMAPIKey = Container.getElementsByClassName("SMAPIKey")[0];
        SMGeneralFeatures = ["fh", "fs", "fmph", "ff", "hr", "lpv", "vai", "ev", "hbs", "at", "pnot", "es"];
        SMGiveawayFeatures = ["dgn", "hfc", "ags", "pgb", "gf", "gv", "egf", "gp", "gwc", "gwr", "elgb", "qgb", "gb", "ggl", "ochgb", "gt", "sgg", "rcvc", "ugs", "er", "gwl", "gesl", "as"];
        SMDiscussionFeatures = ["adot", "dh", "mpp", "ded"];
        SMCommentingFeatures = ["ch", "ct", "cfh", "rbot", "rbp", "mr", "rfi", "rml"];
        SMUserGroupGamesFeatures = ["ap", "uh", "un", "rwscvl", "ugd", "namwc", "nrf", "swr", "luc", "sgpb", "stpb", "sgc", "uf", "wbc", "wbh", "ut", "iwh", "gh", "gs", "egh", "ggt", "gc"];
        SMOtherFeatures = ["sm_ebd", "sm_hb", "ged"];
        for (var i = 0, n = esgst.features.length; i < n; ++i) {
            var id = esgst.features[i].id;
            if (SMGeneralFeatures.indexOf(id) >= 0) {
                SMGeneral.appendChild(getSMFeature(esgst.features[i]));
            } else if (SMGiveawayFeatures.indexOf(id) >= 0) {
                SMGiveaways.appendChild(getSMFeature(esgst.features[i]));
            } else if (SMDiscussionFeatures.indexOf(id) >= 0) {
                SMDiscussions.appendChild(getSMFeature(esgst.features[i]));
            } else if (SMCommentingFeatures.indexOf(id) >= 0) {
                SMCommenting.appendChild(getSMFeature(esgst.features[i]));
            } else if (SMUserGroupGamesFeatures.indexOf(id) >= 0) {
                SMUsers.appendChild(getSMFeature(esgst.features[i]));
            } else if (SMOtherFeatures.indexOf(id) >= 0) {
                SMOthers.appendChild(getSMFeature(esgst.features[i]));
            }
        }
        SMSyncFrequency.selectedIndex = GM_getValue("SyncFrequency");
        LastSync = GM_getValue("LastSync");
        if (LastSync) {
            SMLastSync.classList.remove("notification--warning");
            SMLastSync.classList.add("notification--success");
            SMLastSync.innerHTML = "<i class=\"fa fa-check-circle\"></i> Last synced " + (new Date(LastSync).toLocaleString()) + ".";
        }
        checkSync(true, function (CurrentDate) {
            SMLastSync.classList.remove("notification--warning");
            SMLastSync.classList.add("notification--success");
            SMLastSync.innerHTML =
                "<i class=\"fa fa-check-circle\"></i> Last synced " + CurrentDate.toLocaleString() + ".";
        });
        LastBundleSync = GM_getValue("LastBundleSync");
        if (LastBundleSync) {
            SMLastBundleSync.classList.remove("notification--warning");
            SMLastBundleSync.classList.add("notification--success");
            SMLastBundleSync.innerHTML = "<i class=\"fa fa-check-circle\"></i> Last synced " + (new Date(LastBundleSync).toLocaleString()) + ".";
        }
        document.getElementsByClassName("SMBundleSync")[0].addEventListener("click", function () {
            if (((new Date().getTime()) - LastBundleSync) > 604800000) {
                syncBundleList(function() {
                    var current = new Date();
                    SMLastBundleSync.classList.remove("notification--warning");
                    SMLastBundleSync.classList.add("notification--success");
                    SMLastBundleSync.innerHTML =
                        "<i class=\"fa fa-check-circle\"></i> Last synced " + current.toLocaleString() + ".";
                });
            } else {
                window.alert(`You synced the bundle list in less than a week ago. You can sync only once per week.`);
            }
        });
        var key = GM_getValue(`steamApiKey`, GM_getValue(`SteamAPIKey`));
        if (key) {
            SMAPIKey.value = key;
        }
        SMSyncFrequency.addEventListener("change", function () {
            GM_setValue("SyncFrequency", SMSyncFrequency.selectedIndex);
        });
        SMManageData.addEventListener("click", function () {
            var Popup, SM, SMImport, SMExport, SMDelete;
            Popup = createPopup(true);
            Popup.Icon.classList.add("fa-cog");
            Popup.Title.textContent = "Manage data:";
            SM = {
                Names: {
                    users:  `U`,
                    games: `G`,
                    giveaways: `GG`,
                    Groups: "GP",
                    comments: "C",
                    Emojis: "E",
                    Rerolls: "R",
                    sgCommentHistory: `CH_SG`,
                    stCommentHistory: `CH_ST`,
                    StickiedGroups: "SG",
                    Templates: "T",
                    decryptedGiveaways: "DG"
                }
            };
            createOptions(Popup.Options, SM, [{
                Check: function () {
                    return true;
                },
                Description: "User Notes data.",
                Name: "un",
                Key: "UN",
                ID: "SM_UN"
            }, {
                Check: function () {
                    return true;
                },
                Description: "User Tags data.",
                Name: "ut",
                Key: "UT",
                ID: "SM_UT"
            }, {
                Check: function () {
                    return true;
                },
                Description: "User Giveaways Data data.",
                Name: "udg",
                Key: "UGD",
                ID: "SM_UGD"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Not Activated/Multiple Wins Checker data.",
                Name: "namwc",
                Key: "NAMWC",
                ID: "SM_NAMWC"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Not Received Finder data.",
                Name: "nrf",
                Key: "NRF",
                ID: "SM_NRF"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Whitelist/Blacklist Checker data.",
                Name: "wbc",
                Key: "WBC",
                ID: "SM_WBC"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Real Won/Sent CV Links data.",
                Name: "rwscvl",
                Key: "RWSCVL",
                ID: "SM_RWSCVL"
            }, {
                Check: function () {
                    return true;
                },
                Description: "User Filters data.",
                Name: "uf",
                Key: "UF",
                ID: "SM_UF"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Game Tags data.",
                Name: "gt",
                Key: "GT",
                ID: "SM_GT"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Entered Games Highlighter data.",
                Name: "egh",
                Key: "EGH",
                ID: "SM_EGH"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Game Categories data.",
                Name: "gc",
                Key: "GC",
                ID: "SM_GC"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Giveaways data.",
                Title: "Includes Giveaway Groups Loader data.",
                Name: "giveaways",
                Key: "GG",
                ID: "SM_GG"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Groups data.",
                Title: "Includes groups data.",
                Name: "Groups",
                Key: "GP",
                ID: "SM_GP"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Comments data.",
                Title: "Includes Comment Tracker & Discussion Highlighter data.",
                Name: "comments",
                Key: "C",
                ID: "SM_C"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Emojis data.",
                Title: "Includes Comment Formatting Helper emojis data.",
                Name: "Emojis",
                Key: "E",
                ID: "SM_E"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Rerolls data.",
                Title: "Includes Unsent Gifts Sender rerolls data.",
                Name: "Rerolls",
                Key: "R",
                ID: "SM_R"
            }, {
                Check: function () {
                    return true;
                },
                Description: "SteamGifts comment history data.",
                Title: "Includes SteamGifts' comment History data.",
                Name: "sgCommentHistory",
                Key: "CH_SG",
                ID: "SM_CH_SG"
            }, {
                Check: function () {
                    return true;
                },
                Description: "SteamTrades comment history data.",
                Title: "Includes SteamTrades' comment History data.",
                Name: "stCommentHistory",
                Key: "CH_ST",
                ID: "SM_CH_ST"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Stickied groups data.",
                Title: "Includes Stickied Giveaway Groups data.",
                Name: "StickiedGroups",
                Key: "SG",
                ID: "SM_SG"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Templates data.",
                Title: "Includes Giveaway Templates data.",
                Name: "Templates",
                Key: "T",
                ID: "SM_T"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Decrypted giveaways data.",
                Title: "Includes data from decrypted giveaways.",
                Name: "decryptedGiveaways",
                Key: "DG",
                ID: "SM_DG"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Settings data.",
                Title: "Includes feature settings.",
                Name: "Settings",
                Key: "S",
                ID: "SM_S"
            }, {
                Check: function () {
                    return true;
                },
                Description: "Merge current data with the imported one.",
                Title: "If unchecked, the new data will replace the current one.",
                Name: "Merge",
                Key: "M",
                ID: "SM_M"
            }]);
            Popup.Button.classList.add("SMManageDataPopup");
            Popup.Button.innerHTML =
                "<div class=\"SMImport\"></div>" +
                "<div class=\"SMExport\"></div>" +
                "<div class=\"SMDelete\"></div>";
            SMImport = Popup.Button.firstElementChild;
            SMExport = SMImport.nextElementSibling;
            SMDelete = SMExport.nextElementSibling;
            createButton(SMImport, "fa-arrow-circle-up", "Import", "", "", function (Callback) {
                Callback();
                importSMData(SM);
            });
            createButton(SMExport, "fa-arrow-circle-down", "Export", "", "", function (Callback) {
                Callback();
                exportSMData(SM);
            });
            createButton(SMDelete, "fa-trash", "Delete", "", "", function (Callback) {
                Callback();
                deleteSMData(SM);
            });
            Popup.popUp();
        });
        if (SMManageTags) {
            SMManageTags.addEventListener("click", function () {
                var Popup, MT, SMManageTagsPopup;
                Popup = createPopup(true);
                Popup.Icon.classList.add("fa-cog");
                Popup.Title.textContent = "Manage tags:";
                Popup.TextInput.classList.remove("rhHidden");
                Popup.TextInput.insertAdjacentHTML("beforeBegin", "<div class=\"page__heading\"></div>");
                MT = {};
                addMTContainer(Popup.TextInput.previousElementSibling, MT, {
                    Popup: Popup
                });
                Popup.TextInput.insertAdjacentHTML(
                    "afterEnd",
                    createDescription("Filter users by tag (use commas to separate filters, for example: Filter1, Filter2, ...). Filters are not case sensitive.")
                );
                SMManageTagsPopup = Popup.popUp(function () {
                    var SavedGames, SavedUsers, MTApps, MTSubs, MTUsers, Tags, I, N, Context, Username, SavedTags, J, NumTags, Key;
                    Popup.TextInput.focus();
                    SavedUsers = JSON.parse(GM_getValue(`users`));
                    SavedGames = JSON.parse(GM_getValue(`games`));
                    MTUsers = {};MTApps = {}; MTSubs = {};
                    Tags = {};
                    for (I in SavedUsers.users) {
                        if (SavedUsers.users[I].tags && SavedUsers.users[I].tags.length) {
                            Popup.Results.insertAdjacentHTML(
                                "beforeEnd",
                                "<div>" +
                                "    <a href=\"/user/" + SavedUsers.users[I].username + "\">" + SavedUsers.users[I].username + "</a>" +
                                "</div>"
                            );
                            Context = Popup.Results.lastElementChild.firstElementChild;
                            Username = SavedUsers.users[I].username;
                            if (!MTUsers[Username]) {
                                MTUsers[Username] = [];
                            }
                            MTUsers[Username].push(Context);
                            SMManageTagsPopup.reposition();
                            SavedTags = SavedUsers.users[I].tags;
                            for (J = 0, NumTags = SavedTags.length; J < NumTags; ++J) {
                                Key = SavedTags[J].toLowerCase();
                                if (!Tags[Key]) {
                                    Tags[Key] = [];
                                }
                                Tags[Key].push(Popup.Results.children.length - 1);
                            }
                        }
                    }
                    for (I in SavedGames.apps) {
                        if (SavedGames.apps[I].tags && SavedGames.apps[I].tags) {
                            Popup.Results.insertAdjacentHTML(
                                "beforeEnd",
                                "<div>" +
                                "    <div class=\"table__row-outer-wrap\"><a class=\"table__column__heading\" href=\"https://store.steampowered.com/app/" + I + "\">App: " + I + "</a></div>" +
                                "</div>"
                            );
                            Context = Popup.Results.lastElementChild.firstElementChild;
                            if (!MTApps[I]) {
                                MTApps[I] = [];
                            }
                            MTApps[I].push(Context);
                            SMManageTagsPopup.reposition();
                            SavedTags = SavedGames.apps[I].tags;
                            for (J = 0, NumTags = SavedTags.length; J < NumTags; ++J) {
                                Key = SavedTags[J].toLowerCase();
                                if (!Tags[Key]) {
                                    Tags[Key] = [];
                                }
                                Tags[Key].push(Popup.Results.children.length - 1);
                            }
                        }
                    }
                    for (I in SavedGames.subs) {
                        if (SavedGames.subs[I].tags && SavedGames.subs[I].tags) {
                            Popup.Results.insertAdjacentHTML(
                                "beforeEnd",
                                "<div>" +
                                "    <div class=\"table__row-outer-wrap\"><a class=\"table__column__heading\" href=\"https://store.steampowered.com/sub/" + I + "\">Sub: " + I + "</a></div>" +
                                "</div>"
                            );
                            Context = Popup.Results.lastElementChild.firstElementChild;
                            if (!MTSubs[I]) {
                                MTSubs[I] = [];
                            }
                            MTSubs[I].push(Context);
                            SMManageTagsPopup.reposition();
                            SavedTags = SavedGames.subs[I].tags;
                            for (J = 0, NumTags = SavedTags.length; J < NumTags; ++J) {
                                Key = SavedTags[J].toLowerCase();
                                if (!Tags[Key]) {
                                    Tags[Key] = [];
                                }
                                Tags[Key].push(Popup.Results.children.length - 1);
                            }
                        }
                    }
                    addMTCheckboxes(MTUsers, "User", "beforeBegin", "previousElementSibling", MT);
                    addMTCheckboxes(MTApps, "Game", "beforeBegin", "previousElementSibling", MT);
                    addMTCheckboxes(MTSubs, "Game", "beforeBegin", "previousElementSibling", MT);
                    loadEndlessFeatures(Popup.Results);
                    Popup.TextInput.addEventListener("input", function () {
                        var MTUsers, Matches, Filters, Context, Username;
                        selectMTCheckboxes(MT.UserCheckboxes, "uncheck", MT, "User");
                        removeMTCheckboxes("User", MT);
                        MTUsers = {};
                        Matches = Popup.Results.getElementsByClassName("SMTag");
                        for (I = 0, N = Matches.length; I < N; ++I) {
                            if (Matches[I]) {
                                Matches[I].classList.remove("SMTag");
                            }
                        }
                        if (Popup.TextInput.value) {
                            Popup.Results.classList.add("SMTags");
                            Filters = Popup.TextInput.value.split(/,\s*/g);
                            for (I = 0, N = Filters.length; I < N; ++I) {
                                Key = Filters[I].toLowerCase();
                                if (Tags[Key]) {
                                    for (J = 0, NumTags = Tags[Key].length; J < NumTags; ++J) {
                                        Context = Popup.Results.children[Tags[Key][J]];
                                        Context.classList.add("SMTag");
                                        Context = Context.querySelector("a[href*='/user/']");
                                        Username = Context.textContent;
                                        if (!MTUsers[Username]) {
                                            MTUsers[Username] = [];
                                        }
                                        MTUsers[Username].push(Context);
                                    }
                                }
                            }
                        } else {
                            Popup.Results.classList.remove("SMTags");
                            Matches = Popup.Results.querySelectorAll("a[href*='/user/']");
                            for (I = 0, N = Matches.length; I < N; ++I) {
                                Context = Matches[I];
                                Username = Context.textContent;
                                if (!MTUsers[Username]) {
                                    MTUsers[Username] = [];
                                }
                                MTUsers[Username].push(Context);
                            }
                        }
                        addMTCheckboxes(MTUsers, "User", "beforeBegin", "previousElementSibling", MT);
                        SMManageTagsPopup.reposition();
                    });
                });
            });
        }
        if (SMRecentUsernameChanges) {
            setSMRecentUsernameChanges(SMRecentUsernameChanges);
        }
        if (SMManageFilteredUsers) {
            setSMManageFilteredUsers(SMManageFilteredUsers);
        }
        if (SMCommentHistory) {
            setSMCommentHistory(SMCommentHistory);
        }
        SMAPIKey.addEventListener("input", function () {
            GM_setValue(`steamApiKey`, SMAPIKey.value);
        });
    }

    function getSMFeature(Feature) {
        var Menu, Checkbox, CheckboxInput, SMFeatures;
        Menu = document.createElement("div");
        var ID = Feature.id;
        Menu.insertAdjacentHTML(
            "beforeEnd",
            "<span></span>" + (ID.match(/_/) ? (
                "<span> " + Feature.name + "</span>") : (
                    "<span class=\"popup__actions\">" +
                    "    <a href=\"https://github.com/rafaelgs18/ESGST#" + Feature.name.replace(/(-|\s)/g, "-").replace(/\//g, "").toLowerCase() + "\" target=\"_blank\">" + Feature.name + "</a>" +
                    "</span>")) +
            "<div class=\"form__row__indent SMFeatures rhHidden\"></div>"
        );
        Checkbox = Menu.firstElementChild;
        CheckboxInput = createCheckbox(Checkbox, GM_getValue(ID)).Checkbox;
        SMFeatures = Menu.lastElementChild;
        if (Feature.options) {
            for (var i = 0, n = Feature.options.length; i < n; ++i) {
                SMFeatures.appendChild(getSMFeature(Feature.options[i], Feature.id));
            }
        }
        if (Feature.colors) {
            var color = GM_getValue(`${Feature.id}_color`);
            var bgColor = GM_getValue(`${Feature.id}_bgColor`);
            var html = `
<div class="esgst-sm-colors">
Text: <input type="color" value="${color}">
Background: <input type="color" value="${bgColor}">
<div class="form__saving-button esgst-sm-colors-default">Use Default</div>
</div>
`;
            SMFeatures.insertAdjacentHTML(`beforeEnd`, html);
            var colorContext = SMFeatures.lastElementChild.firstElementChild;
            var bgColorContext = colorContext.nextElementSibling;
            addColorObserver(colorContext, Feature.id, `color`);
            addColorObserver(bgColorContext, Feature.id, `bgColor`);
            bgColorContext.nextElementSibling.addEventListener(`click`, function () {
                colorContext.value = esgst.defaultValues[`${Feature.id}_color`];
                GM_setValue(`${Feature.id}_color`, colorContext.value);
                bgColorContext.value = esgst.defaultValues[`${Feature.id}_bgColor`];
                GM_setValue(`${Feature.id}_bgColor`, bgColorContext.value);
            });
        } else if (Feature.select) {
            var hours = GM_getValue(`gbHours`, 1);
            var input = insertHtml(SMFeatures, `beforeEnd`, `
                <div class="esgst-sm-colors">
                    Time range to trigger highlight: <input type="text" value=${hours}> hours
                </div>
            `);
            input.firstElementChild.addEventListener(`change`, function() {
                GM_setValue(`gbHours`, input.value);
            });
        }
        if (CheckboxInput.checked && SMFeatures.children.length) {
            SMFeatures.classList.remove("rhHidden");
        }
        Checkbox.addEventListener("click", function () {
            GM_setValue(ID, CheckboxInput.checked);
            if (CheckboxInput.checked && SMFeatures.children.length) {
                SMFeatures.classList.remove("rhHidden");
            } else {
                SMFeatures.classList.add("rhHidden");
            }
        });
        return Menu;
    }

    function addColorObserver(context, id, key) {
        context.addEventListener(`change`, function () {
            GM_setValue(`${id}_${key}`, context.value);
        });
    }

    function createSMSections(Sections) {
        var SectionsHTML, I, N;
        SectionsHTML = "";
        for (I = 0, N = Sections.length; I < N; ++I) {
            SectionsHTML +=
                "<div class=\"form__row\">" +
                "    <div class=\"form__heading\">" +
                "        <div class=\"form__heading__number\">" + (I + 1) + ".</div>" +
                "        <div class=\"form__heading__text\">" + Sections[I].Title + "</div>" +
                "    </div>" +
                "    <div class=\"form__row__indent" + (Sections[I].Name ? (" " + Sections[I].Name) : "") + "\">" + (Sections[I].HTML ? Sections[I].HTML : "") + "</div>" +
                "</div>";
        }
        return SectionsHTML;
    }

    function createSMButtons(Items) {
        var Heading, I, N, Item, Icons, J, NumIcons;
        Heading = document.getElementsByClassName("page__heading")[0];
        for (I = 0, N = Items.length; I < N; ++I) {
            Item = Items[I];
            if (Item.Check) {
                Icons = "";
                for (J = 0, NumIcons = Item.Icons.length; J < NumIcons; ++J) {
                    Icons += "<i class=\"fa " + Item.Icons[J] + "\"></i> ";
                }
                Heading.insertAdjacentHTML("beforeEnd", "<a class=\"" + Item.Name + "\" title=\"" + Item.Title + "\">" + Icons + "</a>");
            }
        }
    }

    function importSMData(SM) {
        var File, Reader;
        File = document.createElement("input");
        File.type = "file";
        File.click();
        File.addEventListener("change", function () {
            File = File.files[0];
            if (File.name.match(/\.json/)) {
                Reader = new FileReader();
                Reader.readAsText(File);
                Reader.onload = function () {
                    var Key, Setting;
                    File = JSON.parse(Reader.result);
                    if ((File.rhSGST && (File.rhSGST == "Data")) || (File.ESGST && (File.ESGST == "Data"))) {
                        if (window.confirm("Are you sure you want to import this data? A copy of your current data will be downloaded as precaution.")) {
                            exportSMData(SM);
                            for (Key in File.Data) {
                                if (Key == "Settings") {
                                    if (SM.S.checked) {
                                        for (Setting in File.Data.Settings) {
                                            GM_setValue(Setting, File.Data.Settings[Setting]);
                                        }
                                    }
                                } else if (SM.M.checked) {
                                    var i, j, n, numT, saved, value;
                                    if (Key.match(/^(users|Users)$/)) {
                                        importUsersAndMerge(File, Key, SM);
                                    } else if (Key.match(/^(games|Games)$/)) {
                                        importGamesAndMerge(File, Key, SM);
                                    } else if (Key === `giveaways`) {
                                        importGiveawaysAndMerge(File, Key, SM);
                                    } else if (Key.match(/^(comments|Comments|Comments_ST)$/) && SM.C.checked) {
                                        importCommentsAndMerge(File, Key, SM);
                                    } else if (Key == `Emojis` && SM.E.checked) {
                                        var savedEmojis = GM_getValue(`Emojis`);
                                        var emojis = DOM.parse(File.Data.Emojis).getElementsByTagName(`span`);
                                        for (i = 0, n = emojis.length; i < n; ++i) {
                                            if (!savedEmojis.match(emojis[i].outerHTML)) {
                                                savedEmojis += emojis[i].outerHTML;
                                            }
                                        }
                                        GM_setValue(`Emojis`, savedEmojis);
                                    } else if (Key.match(/^(CommentHistory|sgCommentHistory|stCommentHistory)$/)) {
                                        importCommentHistoryAndMerge(File, Key, SM);
                                    } else if (Key.match(/^(Rerolls|StickiedGroups)$/) && SM[SM.Names[Key]].checked) {
                                        saved = GM_getValue(Key);
                                        for (i = 0, n = File.Data[Key].length; i < n; ++i) {
                                            value = File.Data[Key][i];
                                            if (saved.indexOf(value) < 0) {
                                                saved.push(value);
                                            }
                                        }
                                        GM_setValue(Key, saved);
                                    } else if (Key == `Templates` && SM.T.checked) {
                                        var savedTemplates = GM_getValue(`Templates`);
                                        for (i = 0, n = File.Data.Templates.length; i < n; ++i) {
                                            var template = File.Data.Templates[i];
                                            for (j = 0, numT = savedTemplates.length; j < numT && savedTemplates[j].Name != template.Name; ++j);
                                            if (j >= numT) {
                                                savedTemplates.push(template);
                                            }
                                        }
                                        GM_setValue(`Templates`, savedTemplates);
                                    } else if (SM.Names[Key] && SM[SM.Names[Key]] && SM[SM.Names[Key]].checked) {
                                        GM_setValue(Key, File.Data[Key]);
                                    }
                                } else if (Key.match(/^(users|Users)$/)) {
                                    importUsers(File, Key, SM);
                                } else if (Key.match(/^(games|Games)$/)) {
                                    importGames(File, Key, SM);
                                } else if (Key === `giveaways`) {
                                    importGiveaways(File, Key, SM);
                                } else if (Key.match(/^(CommentHistory|sgCommentHistory|stCommentHistory)$/)) {
                                    importCommentHistory(File, Key, SM);
                                } else if (Key === `comments` && SM.C.checked) {
                                    importComments(File, Key, SM);
                                } else if (SM.Names[Key] && SM[SM.Names[Key]] && SM[SM.Names[Key]].checked) {
                                    GM_setValue(Key, File.Data[Key]);
                                }
                            }
                            window.alert("Imported! It is always recommended to sync your data after importing it.");
                        }
                    } else {
                        window.alert("Wrong file!");
                    }
                };
            } else {
                window.alert("File should be in the .json format.");
            }
        });
    }

    function importGiveawaysAndMerge(File) {
        createLock(`giveawayLock`, 300, function(deleteLock) {
            var saved = JSON.parse(GM_getValue(`giveaways`, `{}`));
            var giveaways = File.Data.giveaways;
            for (var key in giveaways) {
                if (!saved[key]) {
                    saved[key] = {};
                }
                for (var subKey in giveaways[key]) {
                    saved[key][subKey] = giveaways[key][subKey];
                }
            }
            GM_setValue(`giveaways`, JSON.stringify(saved));
            deleteLock();
        });
    }

    function importGiveaways(File) {
        createLock(`giveawayLock`, 300, function(deleteLock) {
            GM_setValue(`giveaways`, JSON.stringify(File.Data.giveaways));
            deleteLock();
        });
    }

    function importUsersAndMerge(File, Key, SM) {
        createLock(`userLock`, 300, function (deleteLock) {
            var savedUsers = JSON.parse(GM_getValue(`users`));
            if (Key === `Users`) {
                mergeUsers(savedUsers, getUserStorageV6(File.Data.Users), SM);
            } else {
                mergeUsers(savedUsers, File.Data.users, SM);
            }
            GM_setValue(`users`, JSON.stringify(savedUsers));
            deleteLock();
        });
    }

    function mergeUsers(savedUsers, users, SM) {
        var keys = {
            notes: `UN`,
            tags: `UT`,
            ugd: `UGD`,
            namwc: `NAMWC`,
            nrf: `NRF`,
            rwscvl: `RWSCVL`,
            wbc: `WBC`,
            uf: `UF`
        };
        for (var key in users.users) {
            if (!savedUsers.users[key]) {
                savedUsers.users[key] = users.users[key];
                savedUsers.steamIds[users.users[key].username] = key;
            } else {
                savedUsers.users[key].id = users.users[key].id;
                savedUsers.users[key].username = users.users[key].username;
                savedUsers.steamIds[users.users[key].username] = key;
                for (var subKey in keys) {
                    if (SM[keys[subKey]].checked && users.users[key][subKey]) {
                        if (subKey === `notes`) {
                            if (savedUsers.users[key].notes) {
                                savedUsers.users[key].notes += `\n\n${users.users[key].notes}`;
                            } else {
                                savedUsers.users[key].notes = users.users[key].notes;
                            }
                        } else if (subKey === `tags`) {
                            if (savedUsers.users[key].tags && savedUsers.users[key].tags.length) {
                                for (var i = 0, n = users.users[key].tags.length; i < n; ++i) {
                                    if (savedUsers.users[key].tags.indexOf(users.users[key].tags[i]) < 0) {
                                        savedUsers.users[key].tags.push(users.users[key].tags[i]);
                                    }
                                }
                            } else {
                                savedUsers.users[key].tags = users.users[key].tags;
                            }
                        } else if (subKey === `ugd`) {
                            if (savedUsers.users[key].ugd) {
                                if (users.users[key].ugd.wonTimestamp > savedUsers.users[key].ugd.wonTimestamp) {
                                    savedUsers.users[key].ugd.won = users.users[key].ugd.won;
                                    savedUsers.users[key].ugd.wonTimestamp = users.users[key].ugd.wonTimestamp;
                                }
                                if (users.users[key].ugd.sentTimestamp > savedUsers.users[key].ugd.sentTimestamp) {
                                    savedUsers.users[key].ugd.sent = users.users[key].ugd.sent;
                                    savedUsers.users[key].ugd.sentTimestamp = users.users[key].ugd.sentTimestamp;
                                }
                            } else {
                                savedUsers.users[key].ugd = users.users[key].ugd;
                            }
                        } else {
                            if (savedUsers.users[key][subKey]) {
                                if (users.users[key][subKey].lastCheck > savedUsers.users[key][subKey].lastCheck) {
                                    savedUsers.users[key][subKey] = users.users[key][subKey];
                                }
                            } else {
                                savedUsers.users[key][subKey] = users.users[key][subKey];
                            }
                        }
                    }
                }
            }
        }
    }

    function importUsers(File, Key, SM) {
        createLock(`userLock`, 300, function(deleteLock) {
            var users;
            if (Key === `Users`) {
                users = getUserStorageV6(File.Data.Users);
            } else {
                users = File.Data.users;
            }
            var keys = {
                notes: `UN`,
                tags: `UT`,
                ugd: `UGD`,
                namwc: `NAMWC`,
                nrf: `NRF`,
                rwscvl: `RWSCVL`,
                wbc: `WBC`,
                uf: `UF`
            };
            var found = true, key;
            for (key in keys) {
                if (!SM[keys[key]].checked) {
                    found = false;
                }
            }
            if (found) {
                GM_setValue(`users`, JSON.stringify(users));
            } else {
                var savedUsers = JSON.parse(GM_getValue(`users`));
                for (key in users.users) {
                    if (!savedUsers.users[key]) {
                        savedUsers.users[key] = {};
                    }
                    savedUsers.users[key].id = users.users[key].id;
                    savedUsers.users[key].username = users.users[key].username;
                    savedUsers.steamIds[users.users[key].username] = key;
                    for (var subKey in keys) {
                        if (SM[keys[subKey]].checked && users.users[key][subKey]) {
                            savedUsers.users[key][subKey] = users.users[key][subKey];
                        }
                    }
                }
                GM_setValue(`users`, JSON.stringify(savedUsers));
            }
            deleteLock();
        });
    }

    function importCommentHistoryAndMerge(File, kk, SM) {
        createLock(`${kk === `CommentHistory` ? `sgCommentHistory` : kk}Lock`, 300, function (deleteLock) {
            var i, j, nS, nC, k, nK, newComments, comments, savedComments;
            savedComments = JSON.parse(GM_getValue(kk === `CommentHistory` ? `sgCommentHistory` : kk));
            newComments = savedComments;
            if (kk === `CommentHistory` && SM.CH_SG.checked) {
                newComments = [];
                comments = getCommentHistoryStorageV6(File.Data.CommentHistory);
                i = 0;
                j = 0;
                nS = savedComments.length;
                nC = comments.length;
                while (i < nS && j < nC) {
                    if (savedComments[i].timestamp > comments[j].timestamp) {
                        newComments.push(savedComments[i]);
                        ++i;
                    } else {
                        for (k = 0, nK = savedComments.length; k < nK && savedComments[k].id !== comments[j].id; ++k);
                        if (k >= nK) {
                            newComments.push(comments[j]);
                        }
                        ++j;
                    }
                }
                while (i < nS) {
                    newComments.push(savedComments[i]);
                    ++i;
                }
                while (j < nC) {
                    for (k = 0, nK = savedComments.length; k < nK && savedComments[k].id !== comments[j].id; ++k);
                    if (k >= nK) {
                        newComments.push(comments[j]);
                    }
                    ++j;
                }
                savedComments = newComments;
            } else if ((kk === `sgCommentHistory` && SM.CH_SG.checked) || (kk === `stCommentHistory` && SM.CH_ST.checked)) {
                newComments = [];
                comments = File.Data[kk];
                i = 0;
                j = 0;
                nS = savedComments.length;
                nC = comments.length;
                while (i < nS && j < nC) {
                    if (savedComments[i].timestamp > comments[j].timestamp) {
                        newComments.push(savedComments[i]);
                        ++i;
                    } else {
                        for (k = 0, nK = savedComments.length; k < nK && savedComments[k].id !== comments[j].id; ++k);
                        if (k >= nK) {
                            newComments.push(comments[j]);
                        }
                        ++j;
                    }
                }
                while (i < nS) {
                    newComments.push(savedComments[i]);
                    ++i;
                }
                while (j < nC) {
                    for (k = 0, nK = savedComments.length; k < nK && savedComments[k].id !== comments[j].id; ++k);
                    if (k >= nK) {
                        newComments.push(comments[j]);
                    }
                    ++j;
                }
            }
            GM_setValue(kk === `CommentHistory` ? `sgCommentHistory` : kk, JSON.stringify(newComments));
            deleteLock();
        });
    }

    function importCommentHistory(File, Key, SM) {
        var key = `${Key === `CommentHistory` ? `sgCommentHistory` : Key}`;
        if ((key === `sgCommentHistory` && SM.CH_SG.checked) || (key === `stCommentHistory` && SM.CH_ST.checked)) {
            createLock(`${key}Lock`, 300, function (deleteLock) {
                GM_setValue(key, JSON.stringify(Key === `CommentHistory` ? getCommentHistoryStorageV6(File.Data.CommentHistory) : File.Data[Key]));
                deleteLock();
            });
        }
    }

    function importCommentsAndMerge(File, Key) {
        createLock(`commentLock`, 300, function(deleteLock) {
            var comments, id, key, savedComments, sgComments, stComments, subKey, type;
            savedComments = JSON.parse(GM_getValue(`comments`));
            if (Key.match(/Comments|Comments_ST/)) {
                sgComments = File.Data.Comments ? File.Data.Comments : {};
                stComments = File.Data.Comments_ST ? File.Data.Comments_ST : {};
                comments = getCommentStorageV6(sgComments, stComments);
            } else {
                comments = File.Data.comments;
            }
            for (type in comments) {
                for (key in comments[type]) {
                    if (savedComments[type][key]) {
                        for (subKey in comments[type][key]) {
                            if (subKey === `comments`) {
                                for (id in comments[type][key].comments) {
                                    if (savedComments[type][key].comments[id]) {
                                        if (comments[type][key].comments[id].timestamp > savedComments[type][key].comments[id].timestamp) {
                                            savedComments[type][key].comments[id].timestamp = comments[type][key].comments[id].timestamp;
                                        }
                                    } else {
                                        savedComments[type][key].comments[id] = comments[type][key].comments.id;
                                    }
                                }
                            } else {
                                savedComments[type][key][subKey] = comments[type][key][subKey];
                            }
                        }
                    } else {
                        savedComments[type][key] = comments[type][key];
                    }
                }
            }
            GM_setValue(`comments`, JSON.stringify(savedComments));
            deleteLock();
        });
    }

    function importComments(File) {
        createLock(`commentLock`, 300, function(deleteLock) {
            GM_setValue(`comments`, JSON.stringify(File.Data.comments));
            deleteLock();
        });
    }

    function importGamesAndMerge(File, Key, SM) {
        var i, n, types, categories, savedGames, games, type, id;
        createLock(`gameLock`, 300, function (deleteLock) {
            types = { apps: ``, subs: `` };
            categories = [`rating`, `bundled`, `owned`, `wishlisted`, `ignored`, `tradingCards`, `achievements`, `multiplayer`, `steamCloud`, `linux`, `mac`, `dlc`, `genres`];
            savedGames = JSON.parse(GM_getValue(`games`));
            if (Key === `Games`) {
                games = getGameStorageV6(File.Data.Games);
                for (type in types) {
                    for (id in games[type]) {
                        if (savedGames[type][id]) {
                            if (games[type][id].tags && SM.GT.checked) {
                                if (!Array.isArray(games[type][id].tags)) {
                                    games[type][id].tags = games[type][id].tags.split(`, `);
                                }
                                if (savedGames[type][id].tags) {
                                    for (i = 0, n = games[type][id].tags.length; i < n; ++i) {
                                        if (savedGames[type][id].tags.indexOf(games[type][id].tags[i]) < 0) {
                                            savedGames[type][id].tags.push(games[type][id].tags[i]);
                                        }
                                    }
                                } else {
                                    savedGames[type][id].tags = games[type][id].tags;
                                }
                            }
                            if (games[type][id].entered && SM.EGH.checked) {
                                savedGames[type][id].entered = true;
                            }
                            if (games[type][id].lastCheck && SM.GC.checked) {
                                if (savedGames[type][id].lastCheck) {
                                    if (games[type][id].lastCheck > savedGames[type][id].lastCheck) {
                                        savedGames[type][id].lastCheck = games[type][id].lastCheck;
                                        for (i = 0, n = categories.length; i < n; ++i) {
                                            savedGames[type][id][categories[i]] = games[type][id][categories[i]];
                                        }
                                    }
                                } else {
                                    savedGames[type][id].lastCheck = games[type][id].lastCheck;
                                    for (i = 0, n = categories.length; i < n; ++i) {
                                        savedGames[type][id][categories[i]] = games[type][id][categories[i]];
                                    }
                                }
                            }
                        } else if (SM.GT.checked || SM.EGH.checked || SM.GC.checked) {
                            if (!savedGames[type][id]) {
                                savedGames[type][id] = {};
                            }
                            if (games[type][id].tags && SM.GT.checked) {
                                savedGames[type][id].tags = games[type][id].tags;
                            }
                            if (games[type][id].entered && SM.EGH.checked) {
                                savedGames[type][id].entered = true;
                            }
                            if (games[type][id].lastCheck && SM.GC.checked) {
                                savedGames[type][id].lastCheck = games[type][id].lastCheck;
                                for (i = 0, n = categories.length; i < n; ++i) {
                                    savedGames[type][id][categories[i]] = games[type][id][categories[i]];
                                }
                            }
                        }
                    }
                }
            } else {
                games = File.Data.games;
                for (type in types) {
                    for (id in games[type]) {
                        if (savedGames[type][id]) {
                            if (games[type][id].tags && SM.GT.checked) {
                                if (!Array.isArray(games[type][id].tags)) {
                                    games[type][id].tags = games[type][id].tags.split(`, `);
                                }
                                if (savedGames[type][id].tags) {
                                    for (i = 0, n = games[type][id].tags.length; i < n; ++i) {
                                        if (savedGames[type][id].tags.indexOf(games[type][id].tags[i]) < 0) {
                                            savedGames[type][id].tags.push(games[type][id].tags[i]);
                                        }
                                    }
                                } else {
                                    savedGames[type][id].tags = games[type][id].tags;
                                }
                            }
                            if (games[type][id].entered && SM.EGH.checked) {
                                savedGames[type][id].entered = true;
                            }
                            if (games[type][id].lastCheck && SM.GC.checked) {
                                if (savedGames[type][id].lastCheck) {
                                    if (games[type][id].lastCheck > savedGames[type][id].lastCheck) {
                                        savedGames[type][id].lastCheck = games[type][id].lastCheck;
                                        for (i = 0, n = categories.length; i < n; ++i) {
                                            savedGames[type][id][categories[i]] = games[type][id][categories[i]];
                                        }
                                    }
                                } else {
                                    savedGames[type][id].lastCheck = games[type][id].lastCheck;
                                    for (i = 0, n = categories.length; i < n; ++i) {
                                        savedGames[type][id][categories[i]] = games[type][id][categories[i]];
                                    }
                                }
                            }
                        } else if (SM.GT.checked || SM.EGH.checked || SM.GC.checked) {
                            if (!savedGames[type][id]) {
                                savedGames[type][id] = {};
                            }
                            if (games[type][id].tags && SM.GT.checked) {
                                savedGames[type][id].tags = games[type][id].tags;
                            }
                            if (games[type][id].entered && SM.EGH.checked) {
                                savedGames[type][id].entered = true;
                            }
                            if (games[type][id].lastCheck && SM.GC.checked) {
                                savedGames[type][id].lastCheck = games[type][id].lastCheck;
                                for (i = 0, n = categories.length; i < n; ++i) {
                                    savedGames[type][id][categories[i]] = games[type][id][categories[i]];
                                }
                            }
                        }
                    }
                }
            }
            GM_setValue(`games`, JSON.stringify(savedGames));
            deleteLock();
        });
    }

    function importGames(File, Key, SM) {
        createLock(`gameLock`, 300, function (deleteLock) {
            var games, savedGames;
            if (Key === `Games`) {
                games = getGameStorageV6(File.Data.Games);
            } else {
                games = File.Data.games;
            }
            if (SM.GT.checked && SM.EGH.checked && SM.GC.checked) {
                GM_setValue(`games`, JSON.stringify(games));
            } else {
                savedGames = JSON.parse(GM_getValue(`games`));
                if (SM.GT.checked) {
                    getSMGames(games, `tags`, savedGames, `apps`);
                    getSMGames(games, `tags`, savedGames, `subs`);
                }
                if (SM.EGH.checked) {
                    getSMGames(games, `entered`, savedGames, `apps`);
                    getSMGames(games, `entered`, savedGames, `subs`);
                }
                if (SM.GC.checked) {
                    getSMGames(games, `lastCheck`, savedGames, `apps`);
                    getSMGames(games, `lastCheck`, savedGames, `subs`);
                }
                GM_setValue(`games`, JSON.stringify(savedGames));
            }
            deleteLock();
        });
    }

    function getSMGames(games, key, selected, type, deleteData) {
        var categories, i, id, n;
        categories = [`rating`, `bundled`, `owned`, `wishlisted`, `ignored`, `tradingCards`, `achievements`, `multiplayer`, `steamCloud`, `linux`, `mac`, `dlc`, `genres`];
        for (id in games[type]) {
            if (typeof games[type][id][key] !== `undefined`) {
                if (deleteData) {
                    if (key === `lastCheck`) {
                        for (i = 0, n = categories.length; i < n; ++i) {
                            if (games[type][id][categories[i]]) {
                                delete games[type][id][categories[i]];
                            }
                        }
                        delete games[type][id][key];
                    } else {
                        delete games[type][id][key];
                    }
                } else {
                    if (!selected[type][id]) {
                        selected[type][id] = {};
                    }
                    if (key === `lastCheck`) {
                        for (i = 0, n = categories.length; i < n; ++i) {
                            if (games[type][id][categories[i]]) {
                                selected[type][id][categories[i]] = games[type][id][categories[i]];
                            }
                        }
                        selected[type][id][key] = games[type][id][key];
                    } else if (key === `tags`) {
                        if (!Array.isArray(games[type][id].tags)) {
                            games[type][id].tags = games[type][id].tags.split(`, `);
                        }
                        selected[type][id][key] = games[type][id][key];
                    } else {
                        selected[type][id][key] = games[type][id][key];
                    }
                }
            }
        }
    }

    function exportSMData(SM) {
        var File, Data, Key, URL;
        File = document.createElement("a");
        File.download = "ESGST.json";
        Data = {};
        for (Key in SM.Names) {
            if (Key === `users`) {
                Data.users = {};
                var keys = {
                    notes: `UN`,
                    tags: `UT`,
                    ugd: `UGD`,
                    namwc: `NAMWC`,
                    nrf: `NRF`,
                    rwscvl: `RWSCVL`,
                    wbc: `WBC`,
                    uf: `UF`
                };
                var users = JSON.parse(GM_getValue(`users`));
                Data.users.users = {};
                for (var key in users.users) {
                    Data.users.users[key] = {
                        id: users.users[key].id,
                        username: users.users[key].username
                    };
                    var added = false;
                    for (var subKey in keys) {
                        if (SM[keys[subKey]].checked && users.users[key][subKey]) {
                            Data.users.users[key][subKey] = users.users[key][subKey];
                            added = true;
                        }
                    }
                    if (!added) {
                        delete Data.users.users[key];
                    }
                }
            } else if (Key === `games`) {
                Data.games = {
                    apps: {},
                    subs: {}
                };
                var games = JSON.parse(GM_getValue(`games`));
                if (SM.GT.checked) {
                    getSMGames(games, `tags`, Data.games, `apps`);
                    getSMGames(games, `tags`, Data.games, `subs`);
                }
                if (SM.EGH.checked) {
                    getSMGames(games, `entered`, Data.games, `apps`);
                    getSMGames(games, `entered`, Data.games, `subs`);
                }
                if (SM.GC.checked) {
                    getSMGames(games, `lastCheck`, Data.games, `apps`);
                    getSMGames(games, `lastCheck`, Data.games, `subs`);
                }
            } else if (Key.match(/sgCommentHistory|stCommentHistory/) && SM[SM.Names[Key]].checked) {
                Data[Key] = JSON.parse(GM_getValue(Key, `{}`));
            } else if (Key.match(/comments|giveaways|descryptedGiveaways/) && SM[SM.Names[Key]].checked) {
                Data[Key] = JSON.parse(GM_getValue(Key, `{}`));
            } else if (SM[SM.Names[Key]].checked) {
                Data[Key] = GM_getValue(Key);
            }
        }
        if (SM.S.checked) {
            var values = GM_listValues();
            Data.Settings = {};
            for (var i = 0, n = values.length; i < n; ++i) {
                var id = values[i];
                if (!SM.Names[id]) {
                    Data.Settings[id] = GM_getValue(id);
                }
            }
        }
        Data = new Blob([JSON.stringify({
            ESGST: "Data",
            Data: Data
        })]);
        URL = window.URL.createObjectURL(Data);
        File.href = URL;
        document.body.appendChild(File);
        File.click();
        File.remove();
        window.URL.revokeObjectURL(URL);
        window.alert("Exported!");
    }

    function deleteSMData(SM) {
        var Key;
        if (window.confirm("Are you sure you want to delete this data? A copy will be downloaded as precaution.")) {
            exportSMData(SM);
            for (Key in SM.Names) {
                if (Key === `users`) {
                    createLock(`userLock`, 300, function(deleteLock) {
                        var keys = {
                            notes: `UN`,
                            tags: `UT`,
                            ugd: `UGD`,
                            namwc: `NAMWC`,
                            nrf: `NRF`,
                            rwscvl: `RWSCVL`,
                            wbc: `WBC`,
                            uf: `UF`
                        };
                        var users = JSON.parse(GM_getValue(`users`));
                        for (var key in users.users) {
                            for (var subKey in keys) {
                                if (SM[keys[subKey]].checked) {
                                   delete users.users[key][subKey];
                                }
                            }
                        }
                        GM_setValue(`users`, JSON.stringify(users));
                        deleteLock();
                    });
                } else if (Key === `games`) {
                    createLock(`gameLock`, 300, function (deleteLock) {
                        var games = JSON.parse(GM_getValue(`games`));
                        if (SM.GT.checked && SM.EGH.checked && SM.GC.checked) {
                            GM_setValue(`games`, JSON.stringify({
                                apps: {},
                                subs: {}
                            }));
                        } else {
                            if (SM.GT.checked) {
                                getSMGames(games, `tags`, null, `apps`, true);
                                getSMGames(games, `tags`, null, `subs`, true);
                            }
                            if (SM.EGH.checked) {
                                getSMGames(games, `entered`, null, `apps`, true);
                                getSMGames(games, `entered`, null, `subs`, true);
                            }
                            if (SM.GC.checked) {
                                getSMGames(games, `lastCheck`, null, `apps`, true);
                                getSMGames(games, `lastCheck`, null, `subs`, true);
                            }
                            GM_setValue(`games`, JSON.stringify(games));
                        }
                        deleteLock();
                    });
                } else if (SM[SM.Names[Key]].checked) {
                    GM_deleteValue(Key);
                }
            }
            window.alert("Deleted!");
        }
    }

    function setSMManageFilteredUsers(SMManageFilteredUsers) {
            var popup;
        SMManageFilteredUsers.addEventListener(`click`, function() {
            if (!popup) {
                popup = createPopup_v6(`fa-eye-slash`, `Filtered Users`);
            var users = JSON.parse(GM_getValue(`users`));
            var filtered = [];
            for (var key in users.users) {
                if (users.users[key].uf && (users.users[key].uf.posts || users.users[key].uf.giveaways || users.users[key].uf.discussions)) {
                    filtered.push(users.users[key]);
                }
            }
            filtered.sort(function(a, b) {
                if (a.username > b.username) {
                    return -1;
                } else {
                    return 1;
                }
            });
            var table = insertHtml(popup.description, `beforeEnd`, `
                <table class="UGDData">
                    <tr>
                        <th>Username</th>
                        <th>Posts Hidden</th>
                        <th>Discussions Hidden</th>
                        <th>Giveaways Hidden</th>
                    </tr>
                </table>
            `);
            for (var i = 0, n = filtered.length; i < n; ++i) {
                var postsIcon = filtered[i].uf.posts ? `<i class="fa fa-check"></i>` : ``;
                var discussionsIcon = filtered[i].uf.discussions ? `<i class="fa fa-check"></i>` : ``;
                var giveawaysIcon = filtered[i].uf.giveaways ? `<i class="fa fa-check"></i>` : ``;
                table.insertAdjacentHTML(`beforeEnd`, `
                    <tr>
                        <td><a href="/user/${filtered[i].username}">${filtered[i].username}</a></td>
                        <td>${postsIcon}</td>
                        <td>${discussionsIcon}</td>
                        <td>${giveawaysIcon}</td>
                    </tr>
                `);
            }
            }
            popup.open();
        });
    }

    function setSMRecentUsernameChanges(SMRecentUsernameChanges) {
        SMRecentUsernameChanges.addEventListener("click", function () {
            var Popup, SMRecentUsernameChangesPopup;
            Popup = createPopup(true);
            Popup.Results.classList.add("SMRecentUsernameChangesPopup");
            Popup.Icon.classList.add("fa-comments");
            Popup.Title.textContent = "Recent Username Changes";
            Popup.Progress.innerHTML =
                "<i class=\"fa fa-circle-o-notch fa-spin\"></i> " +
                "<span>Loading recent username changes...</span>";
            makeRequest(null, "https://script.google.com/macros/s/AKfycbzvOuHG913mRIXOsqHIeAuQUkLYyxTHOZim5n8iP-k80iza6g0/exec?Action=2", Popup.Progress, function (Response) {
                var RecentChanges, HTML, I, N;
                Popup.Progress.innerHTML = "";
                RecentChanges = JSON.parse(Response.responseText).RecentChanges;
                HTML = "";
                for (I = 0, N = RecentChanges.length; I < N; ++I) {
                    HTML += "<div>" + RecentChanges[I][0] + " changed to <a class=\"rhBold\" href=\"/user/" + RecentChanges[I][1] + "\">" + RecentChanges[I][1] + "</a></div>";
                }
                Popup.Results.innerHTML = HTML;
                if (esgst.sg) {
                    loadEndlessFeatures(Popup.Results);
                }
                SMRecentUsernameChangesPopup.reposition();
            });
            SMRecentUsernameChangesPopup = Popup.popUp();
        });
    }

    function setSMCommentHistory(SMCommentHistory) {
        SMCommentHistory.addEventListener("click", function () {
            var comments, i, popup, set;
            popup = createPopup_v6(`fa-comments`, `Comment History`);
            popup.commentHistory = insertHtml(popup.description, `afterBegin`, `<div class="comments esgst-text-left"></div>`);
            comments = JSON.parse(GM_getValue(`${esgst.name}CommentHistory`, `[]`));
            i = 0;
            set = createButtonSet(`green`, `grey`, `fa-plus`, `fa-circle-o-notch fa-spin`, `Load more...`, `Loading more...`, function (callback) {
                getChComments(comments, i, i + 5, popup, function (value) {
                    i = value;
                    if (i > comments.length) {
                        set.set.remove();
                    }
                    callback();
                });
            });
            popup.description.appendChild(set.set);
            popup.open();
            set.trigger();
        });
    }

    function checkNewVersion() {
        var version = GM_getValue(`version`, `0`);
        if (version != GM_info.script.version) {
            makeRequest(null, `https://raw.githubusercontent.com/revilheart/ESGST/master/changelog.txt`, null, function (response) {
                version = GM_info.script.version;
                GM_setValue(`version`, version);
                var reg = new RegExp(`v${version}\\n\\s\\*\\/\\n\\n([\\s\\S]*?)\\n\\n\\/\\*`);
                var changelog = response.responseText.match(reg);
                if (changelog) {
                    var popup = createPopup(true);
                    popup.Icon.classList.add(`fa-code`);
                    popup.Title.textContent = `ESGST v${version} Changelog`;
                    var html = changelog[1].replace(/\* (.+)/g, function (m, p1) {
                        return `<li>${p1}</li>`;
                    }).replace(/\n/g, `<br/>`).replace(/#(\d+)/g, function (m, p1) {
                        return `<a href="https://github.com/revilheart/ESGST/issues/${p1}">#${p1}</a>`;
                    });
                    popup.Description.insertAdjacentHTML(`afterBegin`, html);
                    popup.popUp();
                }
            });
        }
    }

    /*
     * Features - Giveaways
     */

    function startGiveawayFeatures() {
        if (esgst.ochgb || esgst.ggl || esgst.gb || esgst.gwc || esgst.gwr || esgst.elgb || esgst.gwl || esgst.gf || esgst.uf) {
            esgst.endlessFeatures.push(loadGiveawayFeatures);
            loadGiveawayFeatures(document);
        }
    }

    function loadGiveawayFeatures(context) {
        var giveaways, i, n;
        giveaways = getGiveaways(context);
        for (i = 0, n = giveaways.length; i < n; ++i) {
            esgst.giveaways.push(giveaways[i]);
        }
        for (i = 0, n = esgst.giveawayFeatures.length; i < n; ++i) {
            esgst.giveawayFeatures[i](giveaways);
        }
    }

    function getGiveaways(context) {
        var games, giveaway, giveaways, i, matches, n;
        games = JSON.parse(GM_getValue(`games`));
        giveaways = [];
        matches = context.querySelectorAll(`.giveaway__row-outer-wrap, .featured__outer-wrap--giveaway, .table:not(.table--summary) .table__row-outer-wrap`);
        for (i = 0, n = matches.length; i < n; ++i) {
            giveaway = getGiveawayInfo(matches[i], games);
            if (giveaway) {
                giveaways.push(giveaway.giveaway);
            }
        }
        return giveaways;
    }

    function getGiveawayInfo(context, games, ugd) {
        var category, categories, chance, element, giveaway, i, id, info, match, n, thinHeadings;
        giveaway = {};
        giveaway.outerWrap = context;
        giveaway.gameId = giveaway.outerWrap.getAttribute(`data-game-id`);
        info = getGameInfo(giveaway.outerWrap);
        if (info) {
            giveaway.id = info.id;
            giveaway.type = info.type;
            if (games && games[giveaway.type][giveaway.id] && games[giveaway.type][giveaway.id].wishlisted) {
                giveaway.wishlisted = true;
            }
        }
        if (giveaway.outerWrap.classList.contains(`table__row-outer-wrap`) && esgst.giveawayPath) {
            return;
        }
        giveaway.innerWrap = giveaway.outerWrap.querySelector(`.giveaway__row-inner-wrap, .featured__inner-wrap, .table__row-inner-wrap`);
        giveaway.summary = giveaway.innerWrap.querySelector(`.giveaway__summary, .featured__summary`);
        giveaway.entered = giveaway.innerWrap.classList.contains(`is-faded`);
        giveaway.headingName = giveaway.innerWrap.querySelector(`.giveaway__heading__name, .featured__heading__medium, .table__column__heading`);
        giveaway.name = giveaway.headingName.textContent;
        match = giveaway.name.match(/\s\((.+) Copies\)/);
        if (match) {
            giveaway.name = giveaway.name.replace(match[0], ``);
            giveaway.copies = parseInt(match[1].replace(/,/g, ``).match(/\d+/)[0]);
        } else {
            giveaway.copies = 1;
        }
        giveaway.url = esgst.giveawayPath && !ugd ? window.location.pathname : giveaway.headingName.getAttribute(`href`);
        if (giveaway.url) {
            match = giveaway.url.match(/\/giveaway\/(.+?)(\/.+?)$/);
            if (match) {
                giveaway.code = match[1];
            } else {
                return null;
            }
        }
        thinHeadings = giveaway.innerWrap.querySelectorAll(`.giveaway__heading__thin, .featured__heading__small`);
        n = thinHeadings.length;
        if (n > 0) {
            if (n > 1) {
                giveaway.copies = parseInt(thinHeadings[0].textContent.replace(/,/g, ``).match(/\d+/)[0]);
                giveaway.points = parseInt(thinHeadings[1].textContent.match(/\d+/)[0]);
            } else {
                giveaway.copies = 1;
                giveaway.points = parseInt(thinHeadings[0].textContent.match(/\d+/)[0]);
            }
        }
        giveaway.columns = giveaway.innerWrap.querySelector(`.giveaway__columns, .featured__columns`);
        if (giveaway.columns) {
            giveaway.endTimeColumn = giveaway.columns.firstElementChild;
            giveaway.endTime = parseInt(giveaway.endTimeColumn.lastElementChild.getAttribute(`data-timestamp`)) * 1e3;
            giveaway.ended = giveaway.endTime < Date.now();
            if (giveaway.ended && (esgst.userPath || ugd)) {
                giveaway.startTimeColumn = giveaway.endTimeColumn.nextElementSibling.nextElementSibling;
            } else {
                giveaway.startTimeColumn = giveaway.endTimeColumn.nextElementSibling;
            }
            giveaway.startTime = parseInt(giveaway.startTimeColumn.firstElementChild.getAttribute(`data-timestamp`)) * 1e3;
            if (!esgst.userPath || ugd) {
                giveaway.creator = giveaway.startTimeColumn.lastElementChild.textContent;
            }
            giveaway.winners = giveaway.columns.textContent.match(/No winners/) ? 0 : giveaway.copies;
        }
        if (esgst.userPath && !ugd) {
            giveaway.creator = window.location.pathname.match(/^\/user\/(.+)/)[1];
        }
        giveaway.created = giveaway.creator === GM_getValue(`Username`);
        giveaway.links = giveaway.innerWrap.getElementsByClassName(`giveaway__links`)[0];
        if (giveaway.links) {
            giveaway.links.classList.add(`esgst-giveaway-links`);
            giveaway.entriesLink = giveaway.links.firstElementChild;
            giveaway.commentsLink = giveaway.entriesLink.nextElementSibling;
        } else {
            giveaway.entriesLink = document.getElementsByClassName(`sidebar__navigation__item__count`)[1];
            giveaway.commentsLink = document.getElementsByClassName(`sidebar__navigation__item__count`)[0];
        }
        if (giveaway.entriesLink && giveaway.commentsLink) {
            giveaway.entries = parseInt(giveaway.entriesLink.textContent.replace(/,/g, ``).match(/\d+/)[0]);
            giveaway.comments = parseInt(giveaway.commentsLink.textContent.replace(/,/g, ``).match(/\d+/)[0]);
        }
        giveaway.panel = giveaway.innerWrap.getElementsByClassName(`esgst-giveaway-panel`)[0];
        if (!giveaway.panel && (esgst.gwc || esgst.gwr || esgst.elgb)) {
            if (giveaway.links) {
                giveaway.panel = insertHtml(giveaway.links, `afterEnd`, `
                    <div class="giveaway__columns esgst-giveaway-panel"></div>
                    <div style="clear: both;"></div>
                `);
                element = giveaway.startTimeColumn.nextElementSibling;
                while (element) {
                    giveaway.panel.appendChild(element);
                    element = giveaway.startTimeColumn.nextElementSibling;
                }
            } else if (giveaway.columns) {
                giveaway.panel = insertHtml(giveaway.columns, `afterEnd`, `<div class="featured__columns esgst-giveaway-panel"></div>`);
            } else {
                giveaway.panel = insertHtml(giveaway.innerWrap.firstElementChild.nextElementSibling, `afterEnd`, `<div class="table__column--width-small text-center esgst-giveaway-panel"></div>`);
            }
        }
        if (!giveaway.entriesLink) {
            giveaway.entries = parseInt((giveaway.panel || giveaway.innerWrap.firstElementChild.nextElementSibling).nextElementSibling.textContent.replace(/,/g, ``));
        }
        giveaway.levelColumn = giveaway.outerWrap.querySelector(`.giveaway__column--contributor-level, .featured__column--contributor-level`);
        giveaway.level = giveaway.levelColumn ? parseInt(giveaway.levelColumn.textContent.match(/\d+/)[0]) : 0;
        giveaway.inviteOnly = giveaway.outerWrap.querySelector(`.giveaway__column--invite-only, .featured__column--invite-only`);
        giveaway.regionRestricted = giveaway.outerWrap.querySelector(`.giveaway__column--region-restricted, .featured__column--region-restricted`);
        giveaway.group = giveaway.outerWrap.querySelector(`.giveaway__column--group, .featured__column--group`);
        giveaway.whitelist = giveaway.outerWrap.querySelector(`.giveaway__column--whitelist, .featured__column--whitelist`);
        giveaway.pinned = giveaway.outerWrap.closest(`.pinned-giveaways__outer-wrap`);
        chance = context.getElementsByClassName(`esgst-gwc`)[0];
        giveaway.chance = chance ? parseFloat(chance.getAttribute(`data-chance`)) : 0;
        if (esgst.gc) {
            categories = [`bundled`, `tradingCards`, `achievements`, `multiplayer`, `steamCloud`, `linux`, `mac`, `dlc`, `genres`];
            for (i = 0, n = categories.length; i < n; ++i) {
                id = categories[i];
                category = giveaway.outerWrap.getElementsByClassName(`esgst-gc ${id}`)[0];
                if (category) {
                    if (id == `genres`) {
                        giveaway[id] = category.textContent.toLowerCase().split(/,\s/);
                    } else {
                        giveaway[id] = true;
                    }
                    giveaway.gcReady = true;
                }
            }
        }
        return {
            giveaway: giveaway,
            data: {
                gameId: giveaway.gameId,
                gameSteamId: giveaway.id,
                gameType: giveaway.type,
                gameName: giveaway.name,
                code: giveaway.code,
                copies: giveaway.copies,
                points: giveaway.points,
                endTime: giveaway.endTime,
                startTime: giveaway.startTime,
                creator: giveaway.creator,
                winners: giveaway.winners,
                entries: giveaway.entries,
                comments: giveaway.comments,
                level: giveaway.level,
                inviteOnly: giveaway.inviteOnly ? true : false,
                regionRestricted: giveaway.regionRestricted ? true : false,
                group: giveaway.group ? true : false,
                whitelist: giveaway.whitelist ? true : false
            }
        };
    }

    /* Giveaway Bookmarks */

    function loadGb() {
        if (esgst.sg) {
            esgst.giveawayFeatures.push(getGbGiveaways);
            getGbGiveaways(document);
            addGbButton();
        }
    }

    function addGbButton() {
        var button, context, html;
        context = document.getElementsByClassName(`nav__left-container`)[0];
        html = `
            <div class="nav__button-container esgst-hidden" title="View your bookmarked giveaways">
                <div class="nav__button">
                    <i class="fa fa-bookmark"></i>
                </div>
            </div>
        `;
        button = insertHtml(context, `beforeEnd`, html);
        var bookmarked = [], endingSoon = 0;
        createLock(`giveawayLock`, 300, function(deleteLock) {
            var giveaways = JSON.parse(GM_getValue(`giveaways`, `{}`));
            for (var key in giveaways) {
                if (giveaways[key].bookmarked) {
                    if (Date.now() >= giveaways[key].endTime || !giveaways[key].endTime) {
                        delete giveaways[key].bookmarked;
                    } else {
                        bookmarked.push(giveaways[key]);
                        endingSoon = giveaways[key].endTime - Date.now() - (GM_getValue(`gbHours`, 1) * 3600000);
                    }
                }
            }
            if (bookmarked.length) {
                bookmarked.sort(function(a, b) {
                    if (a.endTime > b.endTime) {
                        return 1;
                    } else if (a.endTime < b.endTime) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                button.classList.remove(`esgst-hidden`);
                if (esgst.gb_h && endingSoon <= 0) {
                    button.classList.add(`esgst-gb-highlighted`);
                }
            }
            GM_setValue(`giveaways`, JSON.stringify(giveaways));
            deleteLock();
        });
        button.addEventListener(`click`, function() {
            var popup = createPopup_v6(`fa-bookmark`, `Bookmarked Giveaways`, true);
            var i = 0;
            var n = bookmarked.length;
            var gbGiveaways = insertHtml(popup.description, `beforeEnd`, `<div class="esgst-text-left"></div>`);
            var set = createButtonSet(`green`, `grey`, `fa-plus`, `fa-circle-o-notch fa-spin`, `Load more...`, `Loading more...`, function (callback) {
                loadGbGiveaways(i, i + 5, bookmarked, gbGiveaways, popup, function (value) {
                    i = value;
                    if (i > n) {
                        set.set.remove();
                    }
                    callback();
                });
            });
            popup.description.appendChild(set.set);
            popup.open();
            set.trigger();
        });
    }

    function loadGbGiveaways(i, n, bookmarked, gbGiveaways, popup, callback) {
        if (i < n) {
            if (bookmarked[i]) {
                    request(null, true, `/giveaway/${bookmarked[i].code}/`, function (response) {
                        var responseHtml = DOM.parse(response.responseText);
                        var container = responseHtml.getElementsByClassName(`featured__outer-wrap--giveaway`)[0];
                        if (container) {
                            var heading = responseHtml.getElementsByClassName(`featured__heading`)[0];
                            var columns = heading.nextElementSibling;
                            var remaining = columns.firstElementChild;
                                var url = response.finalUrl;
                                var gameId = container.getAttribute(`data-game-id`);
                                var anchors = heading.getElementsByTagName(`a`);
                                var j, numA, numT;
                                for (j = 0, numA = anchors.length; j < numA; ++j) {
                                    anchors[j].classList.add(`giveaway__icon`);
                                }
                                var hideButton = heading.getElementsByClassName(`featured__giveaway__hide`)[0];
                                if (hideButton) {
                                    hideButton.remove();
                                }
                                var headingName = heading.firstElementChild;
                                headingName.outerHTML = `<a class="giveaway__heading__name" href="${url}">${headingName.innerHTML}</a>`;
                                var thinHeadings = heading.getElementsByClassName(`featured__heading__small`);
                                for (j = 0, numT = thinHeadings.length; j < numT; ++j) {
                                    thinHeadings[0].outerHTML = `<span class="giveaway__heading__thin">${thinHeadings[0].innerHTML}</span>`;
                                }
                                remaining.classList.remove(`featured__column`);
                                var created = remaining.nextElementSibling;
                                created.classList.remove(`featured__column`, `featured__column--width-fill`);
                                created.classList.add(`giveaway__column--width-fill`);
                                created.lastElementChild.classList.add(`giveaway__username`);
                                var avatar = columns.lastElementChild;
                                avatar.remove();
                                var element = created.nextElementSibling;
                                while (element) {
                                    element.classList.remove(`featured__column`);
                                    element.className = element.className.replace(/featured/g, `giveaway`);
                                    element = element.nextElementSibling;
                                }
                                var counts = responseHtml.getElementsByClassName(`sidebar__navigation__item__count`);
                                var image = responseHtml.getElementsByClassName(`global__image-outer-wrap--game-large`)[0].firstElementChild.getAttribute(`src`);
                                var popupHtml = `
<div><div class="giveaway__row-outer-wrap" data-game-id="${gameId}">
<div class="giveaway__row-inner-wrap">
<div class="giveaway__summary">
<h2 class="giveaway__heading">
${heading.innerHTML}
</h2>
<div class="giveaway__columns">
${columns.innerHTML}
</div>
<div class="giveaway__links">
<a href="${url}/entries">
<i class="fa fa-tag"></i>
<span>${counts[1].textContent} entries</span>
</a>
<a href="${url}/comments">
<i class="fa fa-comment"></i>
<span>${counts[0].textContent} comments</span>
</a>
</div>
</div>
${avatar.outerHTML}
<a class="global__image-outer-wrap global__image-outer-wrap--game-medium" href="${url}">
<div class="global__image-inner-wrap" style="background-image:url(${image});"></div>
</a>
</div>
</div></div>
`;
                                gbGiveaways.insertAdjacentHTML(`beforeEnd`, popupHtml);
                                loadEndlessFeatures(gbGiveaways.lastElementChild);
                                if (!esgst.giveawaysPath && !esgst.userPath && !esgst.giveawayPath && !esgst.enteredPath) {
                                    loadGiveawayFeatures(gbGiveaways.lastElementChild);
                                }
                                popup.reposition();
                                window.setTimeout(loadGbGiveaways, 0, ++i, n, bookmarked, gbGiveaways, popup, callback);
                            } else {
                                window.setTimeout(loadGbGiveaways, 0, ++i, n, bookmarked, gbGiveaways, popup, callback);
                            }
                    });
                } else {
                    callback(i + 1);
                }
        } else {
            callback(i);
        }
    }

    function getGbGiveaways(giveaways) {
        var savedGiveaways = JSON.parse(GM_getValue(`giveaways`, `{}`));
        for (var i = 0, n = giveaways.length; i < n; ++i) {
            var giveaway = giveaways[i];
            if (giveaway.creator !== GM_getValue(`Username`) && !giveaway.ended && !giveaway.entered && giveaway.url && !giveaway.innerWrap.getElementsByClassName(`esgst-gb-button`)[0]) {
                if (savedGiveaways[giveaway.code] && savedGiveaways[giveaway.code].bookmarked) {
                    addGbUnbookmarkButton(giveaway);
                } else {
                    addGbBookmarkButton(giveaway);
                }
            }
        }
    }

    function addGbBookmarkButton(giveaway) {
        var button;
        button = insertHtml(giveaway.headingName, `beforeBegin`, `
            <div class="esgst-gb-button" title="Bookmark giveaway">
                <i class="fa fa-bookmark-o"></i>
            </div>
        `);
        button.firstElementChild.addEventListener(`click`, function() {
            button.innerHTML = `<i class="fa fa-circle-o-notch fa-spin"></i>`;
            bookmarkGbGiveaway(giveaway, function() {
                button.remove();
                addGbUnbookmarkButton(giveaway);
            });
        });
    }

    function bookmarkGbGiveaway(giveaway, callback) {
        createLock(`giveawayLock`, 300, function(deleteLock) {
            var giveaways;
            giveaways = JSON.parse(GM_getValue(`giveaways`, `{}`));
            if (!giveaways[giveaway.code]) {
                giveaways[giveaway.code] = {};
            }
            giveaways[giveaway.code].code = giveaway.code;
            giveaways[giveaway.code].endTime = giveaway.endTime;
            giveaways[giveaway.code].bookmarked = true;
            GM_setValue(`giveaways`, JSON.stringify(giveaways));
            deleteLock();
            if (callback) {
                callback();
            }
        });
    }

    function addGbUnbookmarkButton(giveaway) {
        var button;
        button = insertHtml(giveaway.headingName, `beforeBegin`, `
            <div class="esgst-gb-button" title="Unbookmark giveaway">
                <i class="fa fa-bookmark"></i>
            </div>
        `);
        button.firstElementChild.addEventListener(`click`, function() {
            button.innerHTML = `<i class="fa fa-circle-o-notch fa-spin"></i>`;
            unbookmarkGbGiveaway(giveaway, function() {
                button.remove();
                addGbBookmarkButton(giveaway);
            });
        });
    }

    function unbookmarkGbGiveaway(giveaway, callback) {
            createLock(`giveawayLock`, 300, function(deleteLock) {
                var giveaways;
                giveaways = JSON.parse(GM_getValue(`giveaways`, `{}`));
                if (giveaways[giveaway.code]) {
                    delete giveaways[giveaway.code].bookmarked;
                }
                GM_setValue(`giveaways`, JSON.stringify(giveaways));
                deleteLock();
                if (callback) {
                    callback();
                }
            });
    }

    /* Quick Giveaway Browsing */

    function loadQgb() {
        if (esgst.sg) {
            document.getElementsByClassName(`nav__absolute-dropdown`)[0].insertAdjacentHTML(`beforeEnd`, `
                <a class="nav__row" href="/giveaways/search?type=wishlist">
                    <div class="nav__row__summary">
                        <p class="nav__row__summary__name">Browse Wishlist Giveaways</p>
                    </div>
                </a>
                <a class="nav__row" href="/giveaways/search?type=recommended">
                    <div class="nav__row__summary">
                        <p class="nav__row__summary__name">Browse Recommended Giveaways</p>
                    </div>
                </a>
                <a class="nav__row" href="/giveaways/search?type=group">
                    <div class="nav__row__summary">
                        <p class="nav__row__summary__name">Browse Group Giveaways</p>
                    </div>
                </a>
                <a class="nav__row" href="/giveaways/search?type=new">
                    <div class="nav__row__summary">
                        <p class="nav__row__summary__name">Browse New Giveaways</p>
                    </div>
                </a>
            `);
        }
    }

    /* Giveaway Filters */

    function loadGf() {
        if (esgst.giveawaysPath) {
            addGfContainer();
        }
    }

    function addGfContainer() {
        var basicFilter, basicFilters, box, button, categoryFilter, categoryFilters, checkbox, collapse, container, exceptionFilter, exceptionFilters, expand, filter, filters, genres, i, id, input, key, maxKey, minKey, maxSaveKey, maxSavedValue, minSaveKey, minSavedValue, maxValue, minValue, multiple, n, name, oldKey, oldSaveKey, saveKey, step, type, typeFilter, typeFilters, value, values;
        type = window.location.search.match(/type=(recommended|wishlist|group|new)/);
        esgst.gf = {
            type: type ? type[1].replace(/^(.)/, function (m, p1) {
                return p1.toUpperCase();
            }) : ``,
            advancedSearch: window.location.search.match(/(level_min|level_max|entry_min|entry_max|copy_min|copy_max|region_restricted|dlc)/),
            basicFilters: [
                {
                    name: `Level`,
                    minValue: 0,
                    maxValue: 10
                },
                {
                    name: `Entries`,
                    minValue: 0,
                    maxValue: 999999999999,
                },
                {
                    name: `Copies`,
                    minValue: 1,
                    maxValue: 999999999999
                },
                {
                    name: `Points`,
                    minValue: 0,
                    maxValue: 300
                },
                {
                    name: `Chance`,
                    minValue: 0,
                    maxValue: 100,
                    step: 0.01
                }
            ],
            typeFilters: [
                {
                    name: `Pinned`,
                    key: `pinned`
                },
                {
                    name: `Region Restricted`,
                    key: `regionRestricted`
                },
                {
                    name: `Group`,
                    key: `group`
                },
                {
                    name: `Whitelist`,
                    key: `whitelist`
                },
                {
                    name: `Created`,
                    key: `created`
                },
                {
                    name: `Entered`,
                    key: `entered`
                }
            ],
            categoryFilters: [
                {
                    id: `gc_b`,
                    name: esgst.gc_b_r ? `Not Bundled` : `Bundled`,
                    key: `bundled`
                },
                {
                    id: `gc_tc`,
                    name: `Trading Cards`,
                    key: `tradingCards`
                },
                {
                    id: `gc_a`,
                    name: `Achievements`,
                    key: `achievements`
                },
                {
                    id: `gc_mp`,
                    name: `Multiplayer`,
                    key: `multiplayer`
                },
                {
                    id: `gc_sc`,
                    name: `Steam Cloud`,
                    key: `steamCloud`
                },
                {
                    id: `gc_l`,
                    name: `Linux`,
                    key: `linux`
                },
                {
                    id: `gc_m`,
                    name: `Mac`,
                    key: `mac`
                },
                {
                    id: `gc_dlc`,
                    name: `DLC`,
                    key: `dlc`
                },
                {
                    id: `gc_g`,
                    name: `Genres`,
                    key: `genres`
                }
            ],
            exceptionFilters: [
                {
                    name: `Pinned`,
                    key: `exceptionPinned`
                },
                {
                    name: `Region Restricted`,
                    key: `exceptionRegionRestricted`
                },
                {
                    name: `Group`,
                    key: `exceptionGroup`
                },
                {
                    name: `Whitelist`,
                    key: `exceptionWhitelist`
                },
                {
                    name: `Wishlist`,
                    key: `exceptionWishlist`
                },
                {
                    name: `Copies above`,
                    key: `exceptionMultiple`
                }
            ]
        };
        container = insertHtml(esgst.pinnedGiveaways || esgst.mainPageHeading, `beforeBegin`, `
            <div class="pinned-giveaways__outer-wrap esgst-gf-container">
                <div class="pinned-giveaways__inner-wrap esgst-gf-box">
                    <div class="esgst-gf-filters esgst-hidden">
                        <div class="esgst-gf-basic-filters esgst-hidden">
                            <div>
                                <strong>Basic Filters:</strong>
                            </div>
                        </div>
                        <div class="esgst-gf-type-filters">
                            <div>
                                <strong>Type Filters:</strong>
                            </div>
                        </div>
                        <div class="esgst-gf-category-filters">
                            <div>
                                <strong>Category Filters:</strong>
                            </div>
                        </div>
                        <div class="esgst-gf-exception-filters">
                            <div>
                                <strong>Exception Filters:</strong>
                                <i class="fa fa-question-circle" title="If enabled, the corresponding giveaways will not be filtered by the basic filters, but they **will** be filtered by the type/category filters"></i>
                            </div>
                        </div>
                        <div>
                            <div>
                                <strong>Legend:</strong>
                                <i class="fa fa-question-circle" title="This legend applies to the type/category filters, except where noted"></i>
                            </div>
                            <div class="esgst-gf-legend"><i class="fa fa-circle-o"></i> - Hide all.</div>
                            <div class="esgst-gf-legend"><i class="fa fa-circle"></i> - Show only.</div>
                            <div class="esgst-gf-legend"><i class="fa fa-check-circle"></i> - Show all.</div>
                        </div>
                    </div>
                </div>
                <div class="pinned-giveaways__button esgst-gf-button">
                    <span>Expand</span>
                    <span class="esgst-hidden">Collapse</span> giveaway filters (<span>0</span> giveaways currently being filtered).
                </div>
            </div>
        `);
        box = container.firstElementChild;
        filters = box.firstElementChild;
        basicFilters = filters.firstElementChild;
        typeFilters = basicFilters.nextElementSibling;
        categoryFilters = typeFilters.nextElementSibling;
        exceptionFilters = categoryFilters.nextElementSibling;
        button = box.nextElementSibling;
        expand = button.firstElementChild;
        collapse = expand.nextElementSibling;
        esgst.gf.filteredCount = collapse.nextElementSibling;
        if (!esgst.gf.advancedSearch) {
            basicFilters.classList.remove(`esgst-hidden`);
            for (i = 0, n = esgst.gf.basicFilters.length; i < n; ++i) {
                filter = esgst.gf.basicFilters[i];
                name = filter.name;
                minValue = filter.minValue;
                maxValue = filter.maxValue;
                step = filter.step;
                values = ``;
                if (typeof minValue !== `undefined`) {
                    values += ` min="${minValue}"`;
                }
                if (typeof maxValue !== `undefined`) {
                    values += ` max="${maxValue}"`;
                }
                if (typeof step !== `undefined`) {
                    values += `step="${step}"`;
                }
                minKey = `min${name}`;
                maxKey = `max${name}`;
                minSaveKey = `gf_${minKey}${esgst.gf.type}`;
                maxSaveKey = `gf_${maxKey}${esgst.gf.type}`;
                minSavedValue = GM_getValue(minSaveKey, minValue);
                maxSavedValue = GM_getValue(maxSavedValue, maxValue);
                esgst.gf[minKey] = minSavedValue;
                esgst.gf[maxKey] = maxSavedValue;
                basicFilter = insertHtml(basicFilters, `beforeEnd`, `
                    <div class="esgst-gf-basic-filter">
                        <div>Min ${name} <input ${values} type="number" value="${minSavedValue}"></div>
                        <div>Max ${name} <input ${values} type="number" value="${maxSavedValue}"></div>
                    </div>
                `);
                basicFilter.firstElementChild.firstElementChild.addEventListener(`change`, saveGfValue.bind(null, minKey, minSaveKey, null));
                basicFilter.lastElementChild.firstElementChild.addEventListener(`change`, saveGfValue.bind(null, maxKey, maxSaveKey, null));
            }
        }
        for (i = 0, n = esgst.gf.typeFilters.length; i < n; ++i) {
            filter = esgst.gf.typeFilters[i];
            key = filter.key;
            if ((key === `regionRestricted` && !esgst.gf.advancedSearch) || key !== `regionRestricted`) {
                name = filter.name;
                typeFilter = insertHtml(typeFilters, `beforeEnd`, `
                    <div class="esgst-gf-type-filter">
                        <span>${name}</span>
                    </div>
                `);
                saveKey = `gf_${key}${esgst.gf.type}`;
                value = GM_getValue(saveKey, `enabled`);
                esgst.gf[key] = value;
                checkbox = createCheckbox_v6(typeFilter, value, true);
                checkbox.checkbox.addEventListener(`click`, saveGfValue.bind(null, key, saveKey, checkbox));
            }
        }
        if (esgst.gc) {
            for (i = 0, n = esgst.gf.categoryFilters.length; i < n; ++i) {
                filter = esgst.gf.categoryFilters[i];
                id = filter.id;
                if (((id === `gc_dlc` && !esgst.gf.advancedSearch) || id !== `gc_dlc`) && esgst[id]) {
                    name = filter.name;
                    key = filter.key;
                    genres = key === `genres`;
                    categoryFilter = insertHtml(categoryFilters, `beforeEnd`, `
                        <div class="esgst-gf-category-filter">
                            <span>${name} ${genres ? `<i class="fa fa-question-circle" title="If disabled, no games will be filtered by genre; if enabled, only games with the listed genres will appear"></i> <input placeholder="Genre1, Genre2" type="text">` : ``}</span>
                        </div>
                    `);
                    saveKey = `gf_${key}${esgst.gf.type}`;
                    value = GM_getValue(saveKey, genres ? false : `enabled`);
                    esgst.gf[key] = value;
                    checkbox = createCheckbox_v6(categoryFilter, value, genres ? false : true);
                    checkbox.checkbox.addEventListener(`click`, saveGfValue.bind(null, key, saveKey, checkbox));
                    if (genres) {
                        input = categoryFilter.lastElementChild.lastElementChild;
                        key = `genreList`;
                        saveKey = `gf_${key}${esgst.gf.type}`;
                        oldKey = `genresList`;
                        oldSaveKey = `gf_${oldKey}${esgst.gf.type}`;
                        value = GM_getValue(saveKey, GM_getValue(oldSaveKey, ``)).replace(/,(?!\s)/g, `, `);
                        esgst.gf[key] = input.value = value;
                        input.addEventListener(`change`, saveGfValue.bind(null, key, saveKey, input));
                    }
                }
            }
        }
        for (i = 0, n = esgst.gf.exceptionFilters.length; i < n; ++i) {
            filter = esgst.gf.exceptionFilters[i];
            key = filter.key;
            if ((key === `exceptionRegionRestricted` && !esgst.gf.advancedSearch) || key !== `exceptionRegionRestricted`) {
                name = filter.name;
                multiple = key === `exceptionMultiple`;
                exceptionFilter = insertHtml(exceptionFilters, `beforeEnd`, `
                    <div class="esgst-gf-exception-filter">
                        <span>${name} ${multiple ? `<input type="number" min="1">` : ``}</span>
                    </div>
                `);
                saveKey = `gf_${key}${esgst.gf.type}`;
                value = GM_getValue(saveKey, false);
                esgst.gf[key] = value;
                checkbox = createCheckbox_v6(exceptionFilter, value);
                checkbox.checkbox.addEventListener(`click`, saveGfValue.bind(null, key, saveKey, checkbox));
                if (multiple) {
                    input = exceptionFilter.lastElementChild.firstElementChild;
                    key = `exceptionMultipleCopies`;
                    saveKey = `gf_${key}${esgst.gf.type}`;
                    value = GM_getValue(saveKey, 1);
                    esgst.gf[key] = input.value = value;
                    input.addEventListener(`change`, saveGfValue.bind(null, key, saveKey, null));
                }
            }
        }
        button.addEventListener(`click`, toggleGfContainer.bind(null, collapse, expand, filters));
        esgst.endlessFeatures.push(filterGfGiveaways);
        filterGfGiveaways();
    }

    function saveGfValue(key, saveKey, checkbox, event) {
        var value;
        esgst.gf[key] = value = checkbox ? checkbox.value : parseFloat(event.currentTarget.value);
        GM_setValue(saveKey, value);
        filterGfGiveaways();
    }

    function toggleGfContainer(collapse, expand, filters) {
        collapse.classList.toggle(`esgst-hidden`);
        expand.classList.toggle(`esgst-hidden`);
        filters.classList.toggle(`esgst-hidden`);
    }

    function filterGfGiveaways() {
        var count, filtered, genres, giveaway, i, j, k, key, maxKey, minKey, n, n2, n3, name;
        for (i = 0, n = esgst.giveaways.length; i < n; ++i) {
            filtered = false;
            giveaway = esgst.giveaways[i];
            if (!esgst.gf.advancedSearch && ((giveaway.pinned && !esgst.gf.exceptionPinned) || (giveaway.regionRestricted && ((esgst.gf.exceptionRegionRestricted && esgst.gf.advancedSearch) || !esgst.gf.exceptionRegionRestricted)) || (giveaway.group && !esgst.gf.exceptionGroup) || (giveaway.whitelist && !esgst.gf.exceptionWhitelist) || (giveaway.wishlisted && !esgst.gf.exceptionWishlist) || ((giveaway.copies > esgst.gf.exceptionMultipleCopies) && !esgst.gf.exceptionMultiple) || (!giveaway.pinned && !giveaway.regionRestricted && !giveaway.group && !giveaway.whitelist && !giveaway.wishlisted && (giveaway.copies <= esgst.gf.exceptionMultipleCopies)))) {
                for (j = 0, n2 = esgst.gf.basicFilters.length; !filtered && j < n2; ++j) {
                    name = esgst.gf.basicFilters[j].name;
                    minKey = `min${name}`;
                    maxKey = `max${name}`;
                    key = name.toLowerCase();
                    if ((giveaway[key] < esgst.gf[minKey]) || (giveaway[key] > esgst.gf[maxKey])) {
                        filtered = true;
                    }
                }
            }
            for (j = 0, n2 = esgst.gf.typeFilters.length; !filtered && j < n2; ++j) {
                key = esgst.gf.typeFilters[j].key;
                if ((key === `regionRestricted` && !esgst.gf.advancedSearch) || key !== `regionRestricted`) {
                    if (((esgst.gf[key] === `disabled`) && giveaway[key]) || ((esgst.gf[key] === `none`) && !giveaway[key])) {
                        filtered = true;
                    }
                }
            }
            if (esgst.gc && giveaway.gcReady) {
                for (j = 0, n2 = esgst.gf.categoryFilters.length; !filtered && j < n2; ++j) {
                    key = esgst.gf.categoryFilters[j].key;
                    if ((key === `dlc` && !esgst.gf.advancedSearch) || key !== `dlc`) {
                        if (key === `genres` && esgst.gf.genres) {
                            if (giveaway.genres) {
                                genres = esgst.gf.genreList.toLowerCase().split(/,\s/);
                                for (k = 0, n3 = genres.length; k < n3 && giveaway.genres.indexOf(genres[k]) < 0; ++k);
                                if (k >= n3) {
                                    filtered = true;
                                }
                            } else {
                                filtered = true;
                            }
                        } else if (((esgst.gf[key] === `disabled`) && giveaway[key]) || ((esgst.gf[key] === `none`) && !giveaway[key])) {
                            filtered = true;
                        }
                    }
                }
            }
            count = parseInt(esgst.gf.filteredCount.textContent);
            if (filtered) {
                if (!giveaway.outerWrap.classList.contains(`esgst-hidden`)) {
                    esgst.gf.filteredCount.textContent = count + 1;
                    giveaway.outerWrap.classList.add(`esgst-hidden`);
                }
            } else if (giveaway.outerWrap.classList.contains(`esgst-hidden`)) {
                esgst.gf.filteredCount.textContent = count - 1;
                giveaway.outerWrap.classList.remove(`esgst-hidden`);
            }
        }
    }

    /* Giveaway Winning Chance */

    function loadGwc() {
        if (esgst.enteredPath) {
            esgst.endlessFeatures.push(addGwcrHeading);
            addGwcrHeading(document);
        }
        esgst.giveawayFeatures.push(addGwcChances);
    }

    function addGwcChances(giveaways) {
        var giveaway, i, n;
        for (i = 0, n = giveaways.length; i < n; ++i) {
            giveaway = giveaways[i];
            if (!giveaway.innerWrap.getElementsByClassName(`esgst-gwc`)[0]) {
                addGwcChance(insertHtml(giveaway.panel, `beforeEnd`, `<div class="${esgst.giveawayPath ? `featured__column` : ``} esgst-gwc" title="Giveaway Winning Chance">`), giveaway);
            }
        }
    }

    function addGwcChance(context, giveaway) {
        var chance;
        chance = giveaway.entries > 0 ? Math.round(giveaway.copies / giveaway.entries * 10000) / 100 : 100;
        if (chance > 100) {
            chance = 100;
        }
        context.setAttribute(`data-chance`, chance);
        context.innerHTML = `
            <i class="fa fa-area-chart"></i>
            <span>${chance}%</span>
        `;
    }

    /* Giveaway Winning Ratio */

    function loadGwr() {
        if (esgst.enteredPath) {
            esgst.endlessFeatures.push(addGwcrHeading);
            addGwcrHeading(document);
        }
        esgst.giveawayFeatures.push(addGwrRatios);
    }

    function addGwrRatios(giveaways) {
        var giveaway, i, n;
        for (i = 0, n = giveaways.length; i < n; ++i) {
            giveaway = giveaways[i];
            if (!giveaway.innerWrap.getElementsByClassName(`esgst-gwr`)[0]) {
                addGwcRatio(insertHtml(giveaway.panel, `beforeEnd`, `<div class="${esgst.giveawayPath ? `featured__column` : ``} esgst-gwr" title="Giveaway Winning Ratio">`), giveaway);
            }
        }
    }

    function addGwcRatio(context, giveaway) {
        var ratio;
        ratio = Math.round(giveaway.entries / giveaway.copies);
        context.setAttribute(`data-ratio`, ratio);
        context.innerHTML = `
            <i class="fa fa-pie-chart"></i>
            <span>${ratio}:1</span>
        `;
    }

    function addGwcrHeading(context) {
        var table;
        table = context.getElementsByClassName(`table__heading`)[0];
        if (!table.getElementsByClassName(`esgst-gwcr-heading`)[0]) {
            table.firstElementChild.insertAdjacentHTML(`afterEnd`, `<div class="table__column--width-small text-center esgst-gwcr-heading">Chance / Ratio</div>`);
        }
    }

    /* Enter/Leave Giveaway Button */

    function loadElgb() {
        if (!esgst.giveawayPath && !esgst.enteredPath) {
            esgst.giveawayFeatures.push(addElgbButtons);
            esgst.elgbCallback = esgst.elgb_d ? checkElgbDescription : enterElgbGiveaway;
        }
    }

    function addElgbButtons(giveaways) {
        var games, giveaway, i, n;
        games = JSON.parse(GM_getValue(`games`));
        for (i = 0, n = giveaways.length; i < n; ++i) {
            giveaway = giveaways[i];
            if (!giveaway.innerWrap.getElementsByClassName(`esgst-button-set`)[0]) {
                if (!giveaway.ended && !giveaway.created && giveaway.level <= esgst.headerData.level && ((giveaway.id && ((games[giveaway.type][giveaway.id] && !games[giveaway.type][giveaway.id].owned) || !games[giveaway.type][giveaway.id])) || !giveaway.id)) {
                addElgbButton(giveaway);
                }
            }
        }
    }

    function addElgbButton(giveaway, error) {
        if (giveaway.elgbButton) {
            giveaway.elgbButton.remove();
        }
        if (giveaway.entered) {
            giveaway.elgbButton = createButtonSet(`yellow`, `grey`, `fa-minus-circle`, `fa-circle-o-notch fa-spin`, `Leave`, `Leaving...`, leaveElgbGiveaway.bind(null, giveaway)).set;
            giveaway.elgbButton.removeAttribute(`title`);
            giveaway.panel.appendChild(giveaway.elgbButton);
        } else if (giveaway.error) {
            giveaway.elgbButton = createButtonSet(`red`, `grey`, `fa-plus-circle`, `fa-circle-o-notch fa-spin`, `RIP`, `KYS plz`, esgst.elgbCallback.bind(null, giveaway)).set;
            giveaway.elgbButton.setAttribute(`title`, `I'm dead, leave me alone.`);
            giveaway.panel.appendChild(giveaway.elgbButton);
        } else {
            if (giveaway.points <= esgst.headerData.points) {
                giveaway.elgbButton = createButtonSet(`green`, `grey`, `fa-plus-circle`, `fa-circle-o-notch fa-spin`, `Enter`, `Entering...`, esgst.elgbCallback.bind(null, giveaway)).set;
                giveaway.elgbButton.removeAttribute(`title`);
                giveaway.panel.appendChild(giveaway.elgbButton);
            } else {
                giveaway.elgbButton = createButtonSet(`red`, `grey`, `fa-plus-circle`, `fa-circle-o-notch fa-spin`, `Not Enough Points M9 ( ͡° ͜ʖ ͡°)`, `Are you retarded?`, esgst.elgbCallback.bind(null, giveaway)).set;
                giveaway.elgbButton.setAttribute(`title`, `REKT.`);
                giveaway.panel.appendChild(giveaway.elgbButton);
            }
        }
    }

    function checkElgbDescription(giveaway, mainCallback) {
        request(null, false, giveaway.url, function(response) {
            var box, description, popup, set;
            description = DOM.parse(response.responseText).getElementsByClassName(`page__description`)[0];
            if (description || esgst.elgb_rb) {
                popup = createPopup_v6(`fa-file-text-o`, `Giveaway Description`, true);
                if (description) {
                    description.classList.add(`esgst-text-left`);
                    popup.description.insertAdjacentHTML(`beforeEnd`, description.outerHTML);
                }
                if (esgst.elgb_rb) {
                    box = insertHtml(popup.description, `beforeEnd`, `<textarea></textarea>`);
                    addCFHPanel(box);
                }
                set = createButtonSet(`green`, `grey`, `fa-plus-circle`, `fa-circle-o-notch fa-spin`, `Enter Giveaway`, `Entering...`, function (callback) {
                    enterElgbGiveaway(giveaway, function() {
                        mainCallback();
                        if (box && box.value) {
                            request(`xsrf_token=${esgst.xsrfToken}&do=comment_new&description=${box.value}`, false, giveaway.url, function() {
                                callback();
                                popup.opened.close();
                            });
                        } else {
                            callback();
                            popup.opened.close();
                        }
                    });
                });
                popup.description.appendChild(set.set);
                popup.open(function() {
                    if (box) {
                        box.focus();
                    }
                });
                popup.close = function () {
                    mainCallback();
                };
            } else {
                enterElgbGiveaway(giveaway, mainCallback);
            }
        });
    }

    function enterElgbGiveaway(giveaway, callback) {
        request(`xsrf_token=${esgst.xsrfToken}&do=entry_insert&code=${giveaway.code}`, false, `/ajax.php`, function(response) {
            var responseJson;
            responseJson = JSON.parse(response.responseText);
            if (responseJson.type === `success`) {
                giveaway.innerWrap.classList.add(`is-faded`);
                giveaway.entered = true;
                giveaway.error = false;
                addElgbButton(giveaway);
                esgst.headerElements.pointsContainer.textContent = responseJson.points;
                refreshHeaderElements(document);
                if (esgst.hr) {
                    GM_setValue(`sgRefreshedHeaderElements`, JSON.stringify(getHeaderElements()));
                }
                updateElgbButtons();
                if (esgst.egh) {
                    saveEghGame(giveaway.id, giveaway.type);
                }
                if (esgst.gb) {
                    var button = giveaway.outerWrap.getElementsByClassName(`esgst-gb-button`)[0];
                    if (button) {
                        unbookmarkGbGiveaway(giveaway, function() {
                            button.remove();
                            addGbBookmarkButton(giveaway);
                        });
                    }
                }
                if (esgst.gf.filteredCount) {
                    filterGfGiveaways();
                }
                callback();
            } else {
                giveaway.entered = false;
                giveaway.error = true;
                addElgbButton(giveaway);
                callback();
            }
        });
    }

    function leaveElgbGiveaway(giveaway, callback) {
        request(`xsrf_token=${esgst.xsrfToken}&do=entry_delete&code=${giveaway.code}`, false, `/ajax.php`, function(response) {
            var responseJson;
            responseJson = JSON.parse(response.responseText);
            if (responseJson.type === `success`) {
                giveaway.innerWrap.classList.remove(`is-faded`);
                giveaway.entered = false;
                giveaway.error = false;
                addElgbButton(giveaway);
                esgst.headerElements.pointsContainer.textContent = responseJson.points;
                refreshHeaderElements(document);
                if (esgst.hr) {
                    GM_setValue(`sgRefreshedHeaderElements`, JSON.stringify(getHeaderElements()));
                }
                updateElgbButtons();
                callback();
            } else {
                callback();
            }
        });
    }

    function updateElgbButtons() {
        var giveaway, i, n;
        for (i = 0, n = esgst.giveaways.length; i < n; ++i) {
            giveaway = esgst.giveaways[i];
            if (giveaway.elgbButton && !giveaway.entered) {
                addElgbButton(giveaway);
            }
        }
    }

    /* Giveaway Winners Link */

    function loadGwl() {
        if (esgst.userPath) {
            esgst.giveawayFeatures.push(addGwlLinks);
        }
    }

    function addGwlLinks(giveaways) {
        var giveaway, i, link, n;
        for (i = 0, n = giveaways.length; i < n; ++i) {
            giveaway = giveaways[i];
            if (!giveaway.innerWrap.getElementsByClassName(`esgst-gwl`)[0]) {
            if (giveaway.ended) {
                link = giveaway.url ? `href="${giveaway.url}/winners"` : ``;
                giveaway.entriesLink.insertAdjacentHTML(`afterEnd`, `
                    <a class="esgst-gwl" ${link}>
                        <i class="fa fa-trophy"></i>
                        <span>${giveaway.winners} winners</span>
                    </a>
                `);
            }
            }
        }
    }

    /*
     * Features - Comments
     */

    function loadCommentFeatures(context, goToUnread, markRead, markUnread, mainContext) {
        var comments, i, n;
        if (!mainContext) {
            mainContext = document;
        }
        comments = getComments(context, mainContext);
        for (i = 0, n = esgst.commentFeatures.length; i < n; ++i) {
            esgst.commentFeatures[i](comments, goToUnread, markRead, markUnread);
        }
    }

    function getComments(context, mainContext) {
        var comments, i, matches, n, sourceLink;
        comments = [];
        matches = context.querySelectorAll(`:not(.comment--submit) > .comment__parent, .comment__child, .comment_inner`);
        sourceLink = mainContext.querySelector(`.page__heading__breadcrumbs a[href*="/giveaway/"], .page__heading__breadcrumbs a[href*="/discussion/"], .page__heading__breadcrumbs a[href*="/ticket/"], .page_heading_breadcrumbs a[href*="/trade/"]`);
        for (i = 0, n = matches.length; i < n; ++i) {
            comments.push(getCommentInfo(matches[i], sourceLink));
        }
        return comments;
    }

    function getCommentInfo(context, sourceLink) {
        var comment, matches, n, source;
        comment = {};
        comment.comment = context;
        comment.author = comment.comment.querySelector(`.comment__author, .author_name`).textContent.trim();
        comment.actions = comment.comment.querySelector(`.comment__actions, .action_list`);
        matches = comment.actions.querySelectorAll(`[href*="/comment/"]`);
        n = matches.length;
        if (n > 0) {
            comment.permalink = matches[n - 1];
        }
        comment.id = comment.permalink ? comment.permalink.getAttribute(`href`).match(/\/comment\/(.+)/)[1] : ``;
        comment.timestamp = parseInt(comment.actions.firstElementChild.lastElementChild.getAttribute(`data-timestamp`));
        if (esgst.inboxPath) {
            if (esgst.sg) {
                source = comment.comment.closest(`.comments`).previousElementSibling.firstElementChild.firstElementChild.getAttribute(`href`);
            } else {
                source = comment.actions.querySelector(`[href*="/trade/"]`).getAttribute(`href`);
            }
        } else {
            source = sourceLink.getAttribute(`href`);
        }
        source = source.match(/(giveaway|discussion|ticket|trade)\/(.+?)(\/.*)?$/);
        comment.type = `${source[1]}s`;
        comment.code = source[2];
        return comment;
    }

    /* Comment Tracker */

    function loadCt() {
        if (esgst.ct) {
            if ((esgst.giveawaysPath || esgst.commentsPath || esgst.inboxPath || esgst.discussionsPath) && !document.getElementsByClassName(`table--summary`)[0]) {
                esgst.commentFeatures.push(getCtComments);
                if (esgst.commentsPath || esgst.inboxPath) {
                    addCtCommentPanel();
                } else {
                    esgst.endlessFeatures.push(addCtDiscussionPanels);
                    addCtDiscussionPanels(document);
                }
            }
        }
        esgst.endlessFeatures.push(checkCtVisited);
        checkCtVisited(document);
    }

    function getCtComments(comments, goToUnread, markRead, markUnread) {
        if (goToUnread) {
            checkCtComments(comments, true);
        } else {
            createLock(`commentLock`, 300, function(deleteLock) {
                checkCtComments(comments, false, markRead, markUnread);
                deleteLock();
            });
        }
    }

    function checkCtComments(comments, goToUnread, markRead, markUnread) {
        var button, code, comment, i, n, saved, source, type;
        saved = JSON.parse(GM_getValue(`comments`));
        n = comments.length;
        if (n > 0) {
            for (i = 0; i < n; ++i) {
                comment = comments[i];
                if (comment.id || comment.id.match(/^$/)) {
                if (!saved[comment.type][comment.code]) {
                    saved[comment.type][comment.code] = {
                        comments: {}
                    };
                } else {
                    delete saved[comment.type][comment.code].comments.Count;
                    delete saved[comment.type][comment.code].comments.undefined;
                }
                saved[comment.type][comment.code].visited = true;
                button = comment.comment.getElementsByClassName(`esgst-ct-comment-button`)[0];
                if (comment.author === GM_getValue(`Username`)) {
                    markCtCommentRead(comment, saved);
                } else if (!saved[comment.type][comment.code].comments[comment.id] || comment.timestamp !== saved[comment.type][comment.code].comments[comment.id].timestamp) {
                    if (goToUnread) {
                        if (esgst.discussionsPath) {
                            esgst.ctUnreadFound = true;
                            if (comment.id) {
                                window.open(`/go/comment/${comment.id}`);
                            } else {
                                window.open(`/discussion/${comment.code}/`);
                            }
                        } else {
                            goToComment(comment.id, comment.comment);
                        }
                        break;
                    } else if (markRead) {
                        markCtCommentRead(comment, saved);
                        addCtUnreadCommentButton(button, comment);
                    } else {
                        markCtCommentUnread(comment, saved);
                        addCtReadCommentButton(button, comment);
                    }
                } else if (markUnread) {
                    markCtCommentUnread(comment, saved);
                    addCtReadCommentButton(button, comment);
                } else {
                    markCtCommentRead(comment, saved);
                    addCtUnreadCommentButton(button, comment);
                }
                }
            }
            if (!goToUnread) {
                GM_setValue(`comments`, JSON.stringify(saved));
            }
        } else {
            source = window.location.pathname.match(/(giveaway|discussion|trade|ticket)\/(.+?)(\/.*)?$/);
            if (source) {
                type = `${source[1]}s`;
                code = source[2];
                if (!saved[type][code]) {
                    saved[type][code] = {
                        comments: {},
                        visited: true
                    };
                }
                GM_setValue(`comments`, JSON.stringify(saved));
            }
        }
    }

    function markCtCommentRead(comment, comments, save) {
        if (save) {
            createLock(`commentLock`, 300, function(deleteLock) {
                comments = JSON.parse(GM_getValue(`comments`));
                if (!comments[comment.type][comment.code].comments[comment.id]) {
                    comments[comment.type][comment.code].comments[comment.id] = {};
                }
                comments[comment.type][comment.code].comments[comment.id].timestamp = comment.timestamp;
                GM_setValue(`comments`, JSON.stringify(comments));
                deleteLock();
            });
        } else if (comments) {
            if (!comments[comment.type][comment.code].comments[comment.id]) {
                comments[comment.type][comment.code].comments[comment.id] = {};
            }
            comments[comment.type][comment.code].comments[comment.id].timestamp = comment.timestamp;
        }
        comment.comment.classList.add(`esgst-ct-comment-read`);
        comment.comment.style.opacity = `0.5`;
        setHoverOpacity(comment.comment, `1`, `0.5`);
    }

    function markCtCommentUnread(comment, comments, save) {
        if (save) {
            createLock(`commentLock`, 300, function(deleteLock) {
                var comments;
                comments = JSON.parse(GM_getValue(`comments`));
                if (!comments[comment.type][comment.code].comments[comment.id]) {
                    comments[comment.type][comment.code].comments[comment.id] = {};
                }
                comments[comment.type][comment.code].comments[comment.id].timestamp = 0;
                GM_setValue(`comments`, JSON.stringify(comments));
                deleteLock();
            });
        } else if (comments) {
            if (!comments[comment.type][comment.code].comments[comment.id]) {
                comments[comment.type][comment.code].comments[comment.id] = {};
            }
            comments[comment.type][comment.code].comments[comment.id].timestamp = 0;
        }
        comment.comment.classList.remove(`esgst-ct-comment-read`);
        comment.comment.style.opacity = `1`;
        setHoverOpacity(comment.comment, `1`, `1`);
    }

    function addCtReadCommentButton(button, comment) {
        if (!button) {
            button = insertHtml(comment.actions, `beforeEnd`, `<div class="esgst-ct-comment-button"></div>`);
        }
        button.innerHTML = `<i class="fa fa-eye" title="Mark comment as read">`;
        button.firstElementChild.addEventListener(`click`, function() {
            markCtCommentRead(comment, null, true);
            button.innerHTML = ``;
            addCtUnreadCommentButton(button, comment);
        });
    }

    function addCtUnreadCommentButton(button, comment) {
        if (!button) {
            button = insertHtml(comment.actions, `beforeEnd`, `<div class="esgst-ct-comment-button"></div>`);
        }
        button.innerHTML = `<i class="fa fa-eye-slash" title="Mark comment as unread">`;
        button.firstElementChild.addEventListener(`click`, function() {
            markCtCommentUnread(comment, null, true);
            button.innerHTML = ``;
            addCtReadCommentButton(button, comment);
        });
    }

    function addCtCommentPanel() {
        var goToUnread, markRead, markUnread;
        goToUnread = insertHtml(esgst.mainPageHeading, `afterBegin`, `
            <div class="page_heading_btn esgst-heading-button" title="Go to the first unread comment of this page">
                <i class="fa fa-comments-o"></i>
            </div>
            <div class="page_heading_btn esgst-heading-button" title="Mark all comments in this page as read">
                <i class="fa fa-eye"></i>
            </div>
            <div class="page_heading_btn esgst-heading-button" title="Mark all comments in this page as unread">
                <i class="fa fa-eye-slash"></i>
            </div>
        `);
        markRead = goToUnread.nextElementSibling;
        markUnread = markRead.nextElementSibling;
        goToUnread.addEventListener(`click`, function() {
            loadCommentFeatures(document, true);
        });
        markRead.addEventListener(`click`, function() {
            loadCommentFeatures(document, false, true);
        });
        markUnread.addEventListener(`click`, function() {
            loadCommentFeatures(document, false, false, true);
        });
    }

    function addCtDiscussionPanels(context) {
        var code, comments, count, countLink, diff, i, id, match, matches, n, read, url;
        comments = JSON.parse(GM_getValue(`comments`)).discussions;
        matches = context.getElementsByClassName(`table__row-outer-wrap`);
        for (i = 0, n = matches.length; i < n; ++i) {
            match = matches[i];
            countLink = match.getElementsByClassName(`table__column--width-small text-center`)[0];
            if (countLink) {
                count = parseInt(countLink.textContent.replace(/,/g, ``));
                url = match.getElementsByClassName(`table__column__heading`)[0].getAttribute(`href`);
                if (url) {
                    code = url.match(/\/discussion\/(.+?)(\/.*)?$/);
                    if (code) {
                        code = code[1];
                        if (comments[code]) {
                            read = 0;
                            for (id in comments[code].comments) {
                                if (!id.match(/^(Count|undefined|)$/) && comments[code].comments[id].timestamp) {
                                    ++read;
                                }
                            }
                            diff = count === read ? 0 : count - read;
                        } else {
                            diff = count;
                        }
                        addCtDiscussionPanel(code, comments, match, countLink, count, diff, url);
                    }
                }
            }
        }
    }

    function addCtDiscussionPanel(code, comments, container, context, count, diff, url) {
        var diffContainer, goToUnread, loadingIcon, markRead, markUnread, markVisited, markUnvisited, panel;
        panel = insertHtml(context, `beforeEnd`, `
            <span>
                <span class="esgst-hidden">(+${diff})</span>
                <div class="esgst-heading-button esgst-hidden" title="Go to first unread comment of this discussion">
                    <i class="fa fa-comments-o"></i>
                </div>
                <div class="esgst-heading-button esgst-hidden" title="Mark all comments in this discussion as read">
                    <i class="fa fa-eye"></i>
                </div>
                <div class="esgst-heading-button esgst-hidden" title="Mark all comments in this discussion as unread">
                    <i class="fa fa-eye-slash"></i>
                </div>
                <div class="esgst-heading-button esgst-hidden" title="Mark this discussion as visited">
                    <i class="fa fa-check"></i>
                </div>
                <div class="esgst-heading-button esgst-hidden" title="Mark this discussion as unvisited">
                    <i class="fa fa-times"></i>
                </div>
                <i class="fa fa-circle-o-notch fa-spin esgst-hidden"></i>
            </span>
        `);
        diffContainer = panel.firstElementChild;
        goToUnread = diffContainer.nextElementSibling;
        markRead = goToUnread.nextElementSibling;
        markUnread = markRead.nextElementSibling;
        markVisited = markUnread.nextElementSibling;
        markUnvisited = markVisited.nextElementSibling;
        loadingIcon = markUnvisited.nextElementSibling;
        if (diff > 0) {
            diffContainer.classList.remove(`esgst-hidden`);
            goToUnread.classList.remove(`esgst-hidden`);
            markRead.classList.remove(`esgst-hidden`);
            if (diff !== count) {
                markUnread.classList.remove(`esgst-hidden`);
            }
        } else {
            markUnread.classList.remove(`esgst-hidden`);
        }
        if (!comments[code] || !comments[code].visited) {
            markVisited.classList.remove(`esgst-hidden`);
        } else {
            markUnvisited.classList.remove(`esgst-hidden`);
        }
        goToUnread.addEventListener(`click`, function() {
            goToUnread.classList.add(`esgst-hidden`);
            markRead.classList.add(`esgst-hidden`);
            markUnread.classList.add(`esgst-hidden`);
            loadingIcon.classList.remove(`esgst-hidden`);
            esgst.ctUnreadFound = false;
            markCtCommentsReadUnread(true, true, false, false, 1, `${url}/search?page=`, function() {
                loadingIcon.classList.add(`esgst-hidden`);
                diffContainer.classList.add(`esgst-hidden`);
                goToUnread.classList.remove(`esgst-hidden`);
                markRead.classList.remove(`esgst-hidden`);
                markUnread.classList.remove(`esgst-hidden`);
            });
        });
        markRead.addEventListener(`click`, function() {
            goToUnread.classList.add(`esgst-hidden`);
            markRead.classList.add(`esgst-hidden`);
            markUnread.classList.add(`esgst-hidden`);
            loadingIcon.classList.remove(`esgst-hidden`);
            markCtCommentsReadUnread(true, false, true, false, 1, `${url}/search?page=`, function() {
                loadingIcon.classList.add(`esgst-hidden`);
                diffContainer.classList.add(`esgst-hidden`);
                markUnread.classList.remove(`esgst-hidden`);
            });
        });
        markUnread.addEventListener(`click`, function() {
            goToUnread.classList.add(`esgst-hidden`);
            markRead.classList.add(`esgst-hidden`);
            markUnread.classList.add(`esgst-hidden`);
            loadingIcon.classList.remove(`esgst-hidden`);
            createLock(`commentLock`, 300, function(deleteLock) {
                var key;
                comments = JSON.parse(GM_getValue(`comments`));
                for (key in comments.discussions[code].comments) {
                    comments.discussions[code].comments[key].timestamp = 0;
                }
                GM_setValue(`comments`, JSON.stringify(comments));
                deleteLock();
                loadingIcon.classList.add(`esgst-hidden`);
                diffContainer.classList.remove(`esgst-hidden`);
                diffContainer.textContent = `(+${count})`;
                goToUnread.classList.remove(`esgst-hidden`);
                markRead.classList.remove(`esgst-hidden`);
            });
        });
        markVisited.addEventListener(`click`, function() {
            goToUnread.classList.add(`esgst-hidden`);
            markRead.classList.add(`esgst-hidden`);
            markUnread.classList.add(`esgst-hidden`);
            markVisited.classList.add(`esgst-hidden`);
            loadingIcon.classList.remove(`esgst-hidden`);
            createLock(`commentLock`, 300, function(deleteLock) {
                comments = JSON.parse(GM_getValue(`comments`));
                if (!comments.discussions[code]) {
                    comments.discussions[code] = {
                        comments: {}
                    };
                }
                comments.discussions[code].visited = true;
                GM_setValue(`comments`, JSON.stringify(comments));
                deleteLock();
                loadingIcon.classList.add(`esgst-hidden`);
                goToUnread.classList.remove(`esgst-hidden`);
                markRead.classList.remove(`esgst-hidden`);
                markUnread.classList.remove(`esgst-hidden`);
                markUnvisited.classList.remove(`esgst-hidden`);
                container.classList.add(`esgst-ct-visited`);
                container.style.opacity = `0.5`;
                setHoverOpacity(container, `1`, `0.5`);
            });
        });
        markUnvisited.addEventListener(`click`, function() {
            goToUnread.classList.add(`esgst-hidden`);
            markRead.classList.add(`esgst-hidden`);
            markUnread.classList.add(`esgst-hidden`);
            markUnvisited.classList.add(`esgst-hidden`);
            loadingIcon.classList.remove(`esgst-hidden`);
            createLock(`commentLock`, 300, function(deleteLock) {
                comments = JSON.parse(GM_getValue(`comments`));
                delete comments.discussions[code].visited;
                GM_setValue(`comments`, JSON.stringify(comments));
                deleteLock();
                loadingIcon.classList.add(`esgst-hidden`);
                goToUnread.classList.remove(`esgst-hidden`);
                markRead.classList.remove(`esgst-hidden`);
                markUnread.classList.remove(`esgst-hidden`);
                markVisited.classList.remove(`esgst-hidden`);
                container.classList.remove(`esgst-ct-visited`);
                container.style.opacity = `1`;
                setHoverOpacity(container, `1`, `1`);
            });
        });
    }

    function markCtCommentsReadUnread(firstRun, goToUnread, markRead, markUnread, nextPage, url, callback) {
        request(null, true, `${url}${nextPage}`, function(response) {
            var context, pagination;
            context = DOM.parse(response.responseText);
            loadCommentFeatures(context, goToUnread, markRead, markUnread, context);
            if ((goToUnread && !esgst.ctUnreadFound) || !goToUnread) {
                pagination = context.getElementsByClassName(`pagination__navigation`)[0];
                ++nextPage;
                if (pagination && ((goToUnread && ((esgst.ct_r && nextPage > 1) || (!esgst.ct_r && !pagination.lastElementChild.classList.contains(`is-selected`)))) || (!goToUnread && !pagination.lastElementChild.classList.contains(`is-selected`)))) {
                    if (goToUnread && esgst.ct_r) {
                        if (firstRun) {
                            nextPage = parseInt(pagination.lastElementChild.getAttribute(`data-page-number`));
                        } else {
                            nextPage -= 2;
                        }
                        if (nextPage > 1) {
                            window.setTimeout(markCtCommentsReadUnread, 0, false, goToUnread, markRead, markUnread, nextPage, url, callback);
                        } else {
                            callback();
                        }
                    } else {
                        window.setTimeout(markCtCommentsReadUnread, 0, false, goToUnread, markRead, markUnread, nextPage, url, callback);
                    }
                } else {
                    callback();
                }
            } else {
                callback();
            }
        });
    }

    function checkCtVisited(context) {
        var code, comments, container, heading, i, match, matches, n, source, type, url;
        comments = JSON.parse(GM_getValue(`comments`));
        matches = context.querySelectorAll(`.table__column__heading, .giveaway__heading__name, .column_flex h3 a`);
        for (i = 0, n = matches.length; i < n; ++i) {
            match = matches[i];
            url = match.getAttribute(`href`);
            if (url) {
                source = url.match(/(giveaway|discussion|ticket|trade)\/(.+?)(\/.*)?$/);
                if (source) {
                    type = `${source[1]}s`;
                    code = source[2];
                    container = match.closest(`.table__row-outer-wrap, .giveaway__row-outer-wrap, .row_outer_wrap`);
                    if (esgst.ct && comments[type][code] && comments[type][code].visited && container) {
                        if ((type === `giveaways` && esgst.ct_g) || type !== `giveaways`) {
                            container.classList.add(`esgst-ct-visited`);
                            container.style.opacity = `0.5`;
                            setHoverOpacity(container, `1`, `0.5`);
                        }
                    }
                    if (esgst.dh && type === `discussions`) {
                        heading = container.querySelector(`.table__column--width-fill h3`);
                        if (comments[type][code] && comments[type][code].highlighted) {
                            highlightDhDiscussion(code, container);
                            addDhUnhighlightButton(code, container, heading);
                        } else {
                            addDhHighlightButton(code, container, heading);
                        }
                    }
                }
            }
        }
    }

    /* Discussions Highlighter */

    function loadDh() {
        var button, code, comments, container, heading, source;
        if (esgst.sg) {
            button = insertHtml(document.getElementsByClassName(`nav__absolute-dropdown`)[1], `beforeEnd`, `
                <div class="nav__row esgst-dh-view-button">
				    <i class="icon-yellow fa fa-fw fa-star"></i>
					<div class="nav__row__summary">
					    <p class="nav__row__summary__name">Highlighted Discussions</p>
					    <p class="nav__row__summary__description">View your highlighted discussions.</p>
					</div>
				</div>
            `);
            button.addEventListener(`click`, function() {
                var discussions, i, keys, popup, set;
                popup = createPopup_v6(`fa-star`, `Highlighted Discussions`);
                popup.highlightedDiscussions = insertHtml(popup.description, `afterBegin`, `
                    <div class="table esgst-text-left">
                        <div class="table__heading">
							<div class="table__column--width-fill">Summary</div>
							<div class="table__column--width-small text-center">Comments</div>
						</div>
                    </div>
                `);
                discussions = JSON.parse(GM_getValue(`comments`)).discussions;
                keys = Object.keys(discussions);
                i = 0;
                set = createButtonSet(`green`, `grey`, `fa-plus`, `fa-circle-o-notch fa-spin`, `Load more...`, `Loading more...`, function (callback) {
                    getDhDiscussions(discussions, i, i, keys, i + 5, popup, function (value) {
                        i = value;
                        if (i > keys.length) {
                            set.set.remove();
                        }
                        callback();
                    });
                });
                popup.description.appendChild(set.set);
                popup.open();
                set.trigger();
            });
            if (esgst.discussionPath) {
                comments = JSON.parse(GM_getValue(`comments`)).discussions;
                source = window.location.pathname.match(/^\/discussion\/(.+?)(\/.*)?$/);
                if (source) {
                    code = source[1];
                    container = document.getElementsByClassName(`page__heading`)[0];
                    heading = container.getElementsByClassName(`page__heading__breadcrumbs`)[0];
                    if (comments[code] && comments[code].highlighted) {
                        highlightDhDiscussion(code, heading);
                        addDhUnhighlightButton(code, heading, container);
                    } else {
                        addDhHighlightButton(code, heading, container);
                    }
                }
            }
        }
    }

    function highlightDhDiscussion(code, context, save) {
        if (save) {
            createLock(`commentLock`, 300, function(deleteLock) {
                var comments;
                comments = JSON.parse(GM_getValue(`comments`));
                if (!comments.discussions[code]) {
                    comments.discussions[code] = {
                        comments: {}
                    };
                }
                comments.discussions[code].highlighted = true;
                GM_setValue(`comments`, JSON.stringify(comments));
                context.classList.add(`esgst-dh-highlighted`);
                deleteLock();
            });
        } else {
            context.classList.add(`esgst-dh-highlighted`);
        }
    }

    function unhighlightDhDiscussion(code, context, save) {
        if (save) {
            createLock(`commentLock`, 300, function(deleteLock) {
                var comments;
                comments = JSON.parse(GM_getValue(`comments`));
                delete comments.discussions[code].highlighted;
                GM_setValue(`comments`, JSON.stringify(comments));
                context.classList.remove(`esgst-dh-highlighted`);
                deleteLock();
            });
        } else {
            context.classList.remove(`esgst-dh-highlighted`);
        }
    }

    function addDhHighlightButton(code, container, context) {
        var button;
        button = insertHtml(context, `afterBegin`, `
            <div class="esgst-dh-button" title="Click to highlight this discussion">
                <i class="fa fa-star-o"></i>
            <div>
        `);
        button.addEventListener(`click`, function() {
            highlightDhDiscussion(code, container, true);
            button.remove();
            addDhUnhighlightButton(code, container, context);
        });
    }

    function addDhUnhighlightButton(code, container, context) {
        var button;
        button = insertHtml(context, `afterBegin`, `
            <div class="esgst-dh-button" title="Click to unhighlight this discussion">
                <i class="fa fa-star"></i>
            </div>
        `);
        button.addEventListener(`click`, function() {
            unhighlightDhDiscussion(code, container, true);
            button.remove();
            addDhHighlightButton(code, container, context);
        });
    }

    function getDhDiscussions(discussions, i, j, keys, n, popup, callback) {
        var key;
        if (i < n) {
            key = keys[j];
            if (key) {
                if (discussions[key].highlighted) {
                    request(null, false, `/discussion/${key}/`, function(response) {
                        var breadcrumbs, categoryLink, context, usernameLink;
                        context = DOM.parse(response.responseText);
                        breadcrumbs = context.getElementsByClassName(`page__heading__breadcrumbs`);
                        categoryLink = breadcrumbs[0].firstElementChild.nextElementSibling.nextElementSibling;
                        usernameLink = context.getElementsByClassName(`comment__username`)[0];
                        popup.highlightedDiscussions.insertAdjacentHTML(`beforeEnd`, `
                            <div>
                                <div class="table__row-outer-wrap">
    						        <div class="table__row-inner-wrap">
	    						        <div>
                                            ${context.getElementsByClassName(`global__image-outer-wrap`)[0].outerHTML}
                                        </div>
				    			        <div class="table__column--width-fill">
    								        <h3>
                                                <a class="table__column__heading" href="/discussion/${key}/">${categoryLink.nextElementSibling.nextElementSibling.firstElementChild.textContent}</a>
                                            </h3>
			    					        <p>
                                                <a class="table__column__secondary-link" href="${categoryLink.getAttribute(`href`)}">${categoryLink.textContent}</a> -
                                                ${context.querySelector(`.comment [data-timestamp]`).outerHTML} ago by
                                                <a class="table__column__secondary-link" href="${usernameLink.getAttribute(`href`)}">${usernameLink.textContent}</a>
                                            </p>
							            </div>
							            <div class="table__column--width-small text-center">
                                            <a class="table__column__secondary-link" href="/discussion/${key}/">${breadcrumbs[1].textContent.match(/(.+) Comments/)[1]}</a>
                                        </div>
								    </div>
							    </div>
                            </div>
                        `);
                        loadEndlessFeatures(popup.highlightedDiscussions.lastElementChild);
                        popup.reposition();
                        window.setTimeout(getDhDiscussions, 0, discussions, ++i, ++j, keys, n, popup, callback);
                    });
                } else {
                    window.setTimeout(getDhDiscussions, 0, discussions, i, ++j, keys, n, popup, callback);
                }
            } else {
                callback(j + 1);
            }
        } else {
            callback(j);
        }
    }

    /* Comment History */

    function saveChComment(id, timestamp) {
        createLock(`${esgst.name}CommentHistoryLock`, 300, function (deleteLock) {
            var comments, key;
            key = `${esgst.name}CommentHistory`;
            comments = JSON.parse(GM_getValue(key, `[]`));
            comments.unshift({
                id: id,
                timestamp: timestamp
            });
            GM_setValue(key, JSON.stringify(comments));
            deleteLock();
        });
    }

    function getChComments(comments, i, n, popup, callback) {
        var comment, id;
        if (i < n) {
            comment = comments[i];
            if (comment) {
                id = comment.id;
                request(null, false, `https://${window.location.hostname}/go/comment/${id}`, function (response) {
                    var html, parent, responseHtml;
                    responseHtml = DOM.parse(response.responseText);
                    comment = responseHtml.getElementById(id);
                    if (esgst.sg) {
                        comment = comment.closest(`.comment`);
                        comment.firstElementChild.classList.remove(`comment__parent`);
                        comment.firstElementChild.classList.add(`comment__child`);
                    }
                    comment.lastElementChild.remove();
                    parent = comment.parentElement.closest(`.comment, .comment_outer`);
                    if (parent) {
                        parent.lastElementChild.remove();
                        parent.insertAdjacentHTML(`beforeEnd`, `
                            <div class="comment__children comment_children">${comment.outerHTML}</div>
                        `);
                        html = parent.outerHTML;
                    } else {
                        if (esgst.st) {
                            comment.getElementsByClassName(`action_list`)[0].firstElementChild.insertAdjacentHTML(`afterEnd`, `
                                <a href="${response.finalUrl}">${responseHtml.title}</a>
                            `);
                        }
                        html = esgst.sg ? `
                            <div class="comments__entity">
                                <p class="comments__entity__name">
                                    <a href="${response.finalUrl}">${responseHtml.title}</a>
                                </p>
                            </div>` : ``;
                        html += `<div class="comment__children comment_children">${comment.outerHTML}</div>`;
                    }
                    popup.commentHistory.insertAdjacentHTML(`beforeEnd`, `<div class="comment comments comment_outer">${html}</div>`);
                    loadEndlessFeatures(popup.commentHistory.lastElementChild);
                    popup.reposition();
                    window.setTimeout(getChComments, 0, comments, ++i, n, popup, callback);
                });
            } else {
                callback(i + 1);
            }
        } else {
            callback(i);
        }
    }

    function loadReplyMentionLink(context) {
        var matches = context.getElementsByClassName(esgst.sg ? "comment__children" : "comment_children");
        for (var i = 0, n = matches.length; i < n; ++i) {
            var Matches = matches[i].children;
            if (Matches.length) {
                addRMLLink(esgst.sg ? matches[i].parentElement.getElementsByClassName("comment__summary")[0] : matches[i].parentElement, Matches);
            }
        }
    }

    function addRMLLink(Context, Matches) {
        var Username, ID, I, N, RMLLink;
        Username = Context.getElementsByClassName(esgst.sg ? "comment__username" : "author_name")[0].textContent.trim();
        ID = Context.id;
        for (I = 0, N = Matches.length; I < N; ++I) {
            Context = Matches[I].getElementsByClassName(esgst.sg ? "comment__actions" : "action_list")[0];
            RMLLink = Context.getElementsByClassName("RMLLink")[0];
            if (RMLLink) {
                RMLLink.textContent = "@" + Username;
            } else {
                Context.insertAdjacentHTML("beforeEnd", "<a class=\"comment__actions__button RMLLink\" href=\"#" + ID + "\">@" + Username + "</a>");
            }
        }
    }

})();
