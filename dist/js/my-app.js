// Initialize your app
var myApp = new Framework7({
    // 'swipeBackPage': true
});
// Export selectors engine
var $$ = Dom7;

var $page = $$('.views')
    , $ListCont = $$('#hero_list ul')
    , Xhr = null
    , pathObj = {
                    "cn": 'https://api.battlenet.com.cn/d3',
                    'tw': 'https://tw.api.battle.net/d3',
                    'us': 'https://us.api.battle.net/d3',
                    'eu': 'https://eu.api.battle.net/d3',
                    'kr': 'https://kr.api.battle.net/d3'
                }
    , localeObj = {
                    "cn": 'zh_CN',
                    'tw': 'zh_TW',
                    'us': 'en_US',
                    'eu': 'en_GB',
                    'kr': 'ko_KR'
                }
    , searchArea = 'cn'
    , apiKey = 'ycvbhp2d558gf5cv5amkpmm284wbe8ec'
    , heroPagePara = ''
    , searchHistory = {};

if (localStorage.searchHistory){

    searchHistory = JSON.parse(localStorage.searchHistory);

    for (var i = 0;i < searchHistory.tags.length;i ++){

        var tpl = ['<li><a data-tag="' + searchHistory.tags[i] + '" class="tag-search-history" href="javascript:;">',
                        '<div class="item-content">',
                            '<div class="item-inner">',
                            '<div class="item-title">' + searchHistory.tags[i] + '</div>',
                            '</div>',
                        '</div>',
                    '</a><li>'];

        $$('#history_list ul').append(tpl.join(''));

    }

}

console.log(searchHistory);

//getUrlPara
function getUrlPara(key) {

    var arg = heroPagePara;
        
    if (arg=='') return '';
    
    arg = arg.substring(1, arg.length);
    var args = arg.split("&"); 
    
    var value = '';
    
    for (var i = 0; i < args.length; i ++) {
        var item = args[i];
        var arg = item.split("=");
        if (arg.length < 2) continue;
        if (arg[0] == key) value = arg[1];
    }

    return value;

}

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

//获取列表
function getProfile (tag) {

    if (tag.length == 0 || $$('#hero_list .item-link').length > 0){

        return;

    }

    // loader.init('.profile-list-con', 'profile-list-loading');

    //判断是否有请求未完成,有就中断
    if (Xhr){

        Xhr.abort();

    }

    Xhr = $$.ajax({
        type:'GET',
        url: pathObj[searchArea] + '/profile/' + tag.replace('#', '-') + '/?locale=' + localeObj[searchArea] + '&apikey=' + apiKey,
        data: {

        },
        dataType: 'jsonp',
        success: function(data){

            var data = JSON.parse(data),
                heroArry = data.heroes,
                heroFile = [];

            console.log(searchHistory);

            if (data.battleTag) {

                searchHistory.tags = [];

                searchHistory.tags.push(data.battleTag);

                localStorage.searchHistory = JSON.stringify(searchHistory);

                for (var i = 0;i < heroArry.length;i ++){

                    var heroTpl = ['<li><a href="hero.html?name=' + heroArry[i].name + '&id=' + heroArry[i].id + '&area=' + searchArea + '&tag=' + data.battleTag.replace('#', '-') + '" data-href="?name=' + heroArry[i].name + '&id=' + heroArry[i].id + '&area=' + searchArea + '&tag=' + data.battleTag.replace('#', '-') + '" class="item-link">',
                                      '<div class="item-content">',
                                        '<div class="item-inner">', 
                                          '<div class="item-title">' + heroArry[i].name + '-' + heroArry[i].class + '-' + heroArry[i].level + '级</div>',
                                        '</div>',
                                      '</div></a>',
                                  '</li>'];

                    $ListCont.append(heroTpl.join(''));

                }

                // localStorage.heros = JSON.stringify(heroFile);

            }

            // $ListCont.html(pageContent({'data': data, 'area': searchArea}));

        },  
        error : function() {    

        },
        complete:function(){

            // loader.hide('.profile-list-loading');

        }
    });

}

//查看英雄页面
function gotoHeroPage() {

    $page.on('click','.item-link',function(){

        var url = $$(this).data('href');

        console.log(url);

        heroPagePara = url;

    });

}

//查看历史tag
function tagSearch() {

    $page.on('click', '.tag-search-history', function(){

        var thiz = $$(this),
            thizTag = thiz.data('tag');

        getProfile(thizTag);

    })

}

//搜索
function search () {

    $page.on('click','#search_btn',function(){

        var uTag = $$('#search_input').val();

        searchArea = $$('#server_area_menu').val();

        getProfile(uTag);

    });

    //回车搜索
    $page.on('keyup', '#search_input', function(e){

        var keyCode = e.which,
            keyWord = $$('#search_input').val();

        searchArea = $$('#server_area_menu').val();

        if (keyCode == 13){

            if (keyWord.length > 0){
                
                $$('#search_btn').trigger('click');

            }

        }

    });

}

//获取英雄信息
function getHero (tag, id, area) {

    if (id.length == 0 || tag.length == 0){

        return;

    }

    //判断是否有请求未完成,有就中断
    if (Xhr){

        Xhr.abort();

    }

    Xhr = $$.ajax({
        type:'GET',
        url: pathObj[area] + '/profile/' + tag + '/hero/' + id + '?locale=' + localeObj[area] + '&apikey=' + apiKey,
        data: {

        },
        dataType: 'jsonp',
        success: function(data){

            var data = JSON.parse(data);

            data.lastUpdated = new Date(parseInt(data["last-updated"]) * 1000).toLocaleString().replace(/\//g, "-");

            var heroTpl = ['<div class="hero-content">',
                                '<div class="avator-con clearfix">',
                                    '<div class="avator">',
                                        '<span class="hero-head ' + data.class + '-' + data.gender + '"></span>',
                                    '</div>',
                                    // '<p class="name">' + data.name + '</p>',
                                    '<p class="level">等级：<em>' + data.level + '</em></p>',
                                    '<p class="">巅峰等级：<em>' + data.paragonLevel + '</em></p>',
                                    '<p class="">精英击杀：<em>' + data.kills.elites + '</em></p>',
                                '</div>',
                                '<div class="stat-info">',
                                    '<p><span>伤害：<em>' + data.stats.damage + '</em></span><span>韧性：<em>' + data.stats.toughness + '</em></span></p>',
                                    '<p><span>攻速：<em>' + data.stats.attackSpeed.toFixed(2) + '</em></span><span>护甲：<em>' + data.stats.armor + '</em></span></p>',
                                    '<p><span>生命：<em>' + data.stats.life + '</em></span><span>治疗：<em>' + data.stats.healing + '</em></span></p>',
                                    '<p><span>暴击率：<em>' + data.stats.critChance.toFixed(3) * 100 + '%</em></span><span>暴击伤害：<em>' + (data.stats.critDamage * 100).toFixed(0) + '%</em></span></p>',
                                    '<p><span>力量：<em>' + data.stats.strength + '</em></span><span>敏捷：<em>' + data.stats.dexterity + '</em></span></p>',
                                    '<p><span>体力：<em>' + data.stats.vitality + '</em></span><span>智力：<em>' + data.stats.intelligence + '</em></span></p>',
                                    '<p><span>物理抗性：<em>' + data.stats.physicalResist + '</em></span><span>火焰抗性：<em>' + data.stats.fireResist + '</em></span></p>',
                                    '<p><span>冰寒抗性：<em>' + data.stats.coldResist + '</em></span><span>电击抗性：<em>' + data.stats.lightningResist + '</em></span></p>',
                                    '<p><span>毒素抗性：<em>' + data.stats.poisonResist + '</em></span><span>秘法抗性：<em>' + data.stats.arcaneResist + '</em></span></p>',
                                    '<p>最后登录：<em>' + data.lastUpdated + '</em></p>',
                                '</div>',
                                '<div class="skill-info">',
                                    '<ul class="clearfix"></ul>',
                                '</div>',
                                '<div class="equip-info clearfix">',
                                '</div>',
                            '</div>'].join('');

            var skillData = data.skills.active;

            $$('.hero-page').append(heroTpl);

            for (var i = 0; i < skillData.length; i ++){

                var skillTpl = ['<li class="skill-icon-con">',
                                    '<a class="skill-icon" href="javascript:;">',
                                        '<img src="http://content.battlenet.com.cn/d3/icons-zh-cn/skills/42/' + skillData[i].skill.icon + '.png">',
                                    '</a>',
                                    '<div class="skill-desc-con">',
                                        '<h3>' + skillData[i].skill.name + '</h3>',
                                        '<div class="main clearfix">',
                                            '<img src="http://content.battlenet.com.cn/d3/icons-zh-cn/skills/42/' + skillData[i].skill.icon + '.png">',
                                            '<p>' + skillData[i].skill.description.replace(/\r\n/g, '<br>') + '</p>',
                                        '</div>',
                                        '<h3>' + skillData[i].rune.name + '</h3>',
                                        '<div class="rune clearfix">',
                                            // '<img src="http://content.battlenet.com.cn/d3/icons-zh-cn/skills/42/' + skillData[i].rune.icon + '.png">',
                                            '<p>' + skillData[i].rune.description.replace(/\r\n/g, '<br>') + '</p>',
                                        '</div>',
                                    '</div>',
                                '</li>'].join('');

                $$('.skill-info ul').append(skillTpl);

            }



        },  
        error : function() {    

        },
        complete:function(){

        }
    });

}

//查看技能
function checkSkill() {

    $page.on('mouseover', '.skill-icon', function(e){

        var thiz = $$(this);

        thiz.next().show();

    });

    $page.on('mouseout', '.skill-icon', function(e){

        var thiz = $$(this);

        thiz.next().hide();

    });

}

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('hero', function (page) {
    // run createContentPage func after link was clicked

    // myApp.alert('Here comes hero page');

    var name = getUrlPara('name'),
        area = getUrlPara('area'),
        id = getUrlPara('id'),
        tag = getUrlPara('tag');

    $$('#hero_page_title').text(name);

    getHero(tag, id, area);

    checkSkill();

    // createContentPage();

    // $$('.create-page').on('click', function () {
    //     createContentPage();
    // });
});

tagSearch();

search ();

gotoHeroPage();

// Option 1. Using one 'pageInit' event handler for all pages (recommended way):
// $$(document).on('pageInit', function (e) {
//   // Get page data from event data
//   var page = e.detail.page;
  
//   if (page.name === 'about') {
//     // Following code will be executed for page with data-page attribute equal to "about"
//     myApp.alert('Here comes About page');
//   }
// })

// Generate dynamic page
var dynamicPageIndex = 0;
// function createContentPage() {

// 	mainView.router.loadContent(
//         '<!-- Top Navbar-->' +
//         '<div class="navbar">' +
//         '  <div class="navbar-inner">' +
//         '    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
//         '    <div class="center sliding">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
//         '  </div>' +
//         '</div>' +
//         '<div class="pages">' +
//         '  <!-- Page, data-page contains page name-->' +
//         '  <div data-page="dynamic-pages" class="page">' +
//         '    <!-- Scrollable page content-->' +
//         '    <div class="page-content">' +
//         '      <div class="content-block">' +
//         '        <div class="content-block-inner">' +
//         '          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
//         '          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
//         '        </div>' +
//         '      </div>' +
//         '    </div>' +
//         '  </div>' +
//         '</div>'
//     );
// 	return;
// }