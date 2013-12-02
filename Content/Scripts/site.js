/*global $, CodeMirror */
"use strict";
var EasyEditor = function (editor, display) {
    this.editorEl = editor;
    this.displayEl = display;
    this.bindBackgroundColor();
    this.bindSubmit();
    this.bindAddElement();
    this.createEditor();
    this.bindFullScreen();
    this.setDisplayBackgroundColor("white");
};

EasyEditor.prototype = {
    styleSheet: "",
    createEditor: function () {
        var mixedMode = {
            name: "htmlmixed",
            lineWrapping: true,
            scriptTypes: [{
                matches: /\/x-handlebars-template|\/x-mustache/i,
                mode: null
            }, {
                matches: /(text|application)\/(x-)?vb(a|script)/i,
                mode: "vbscript"
            }]
        };
        this.editor = CodeMirror.fromTextArea(this.editorEl, {
            mode: mixedMode,
            tabMode: "indent"
        });
        this.editor.setValue("<html>\r\n\t<body>\r\n\t</body>\r\n</html>");
    },

    addElement: function (elType) {
        var currentCode = this.getCode(),
            spacingString = '\t\t';
        var element = this.elementConfigurations[elType];
        var elementString = this.elementCreateFunctions[element.CreateFunction](element.Text, elType);
        if(!elementString){
            return;
        }
        currentCode = currentCode.insert(currentCode.indexOf("</body>") - 1, spacingString + elementString);
        this.setCode(currentCode);
        this.renderSite();
        return;
    },

    renderSite: function () {
        $(this.displayEl).html(this.getCode());
    },

    getCode: function () {
        return this.editor.getValue();
    },

    setCode: function (value) {
        this.editor.setValue(value);
    },

    setDisplayBackgroundColor: function (color) {
        $(this.displayEl).css("background-color", color);
    },

    bindAddElement: function () {
        var ez = this;
        $(".element-helper").click(function () {
            var elType = $(this).attr("id");
            ez.addElement(elType);
        });
    },

    bindFullScreen: function () {
        $("#full-screen").click(function(){
            $("#site-display").toggleClass("full-screen");
            if($("#site-display").hasClass("full-screen")){
                $("#full-screen").addClass("full-screen-close").html("Close Full Screen - X");
            }
            else{
                $("#full-screen").removeClass("full-screen-close").html("View in Full Screen <img src='Content/Images/fullscreen_alt.png'/>");
            }
        });
    },

    bindBackgroundColor: function () {
        var ez = this;
        $(".background-color").click(function () {
            ez.setDisplayBackgroundColor($(this).attr("id"));
        });
    },

    bindSubmit: function () {
        var ez = this;
        $("#submit").click(function () {
            ez.renderSite();
        });
    },

    elementCreateFunctions: {
        listCreate: function (text, elType) {
            var list = $('<' + elType + '/>');
            $.each(text, function () {
                list.append("\r\n\t\t\t<li>" + this + "</li>");
            });
            list.append("\r\n\t\t")
            return  list.clone().wrap('<div/>').parent().html() + "\r\n";
        },

        genericCreate: function (text, elType) {
            return $('<' + elType + '/>', {
                text: text
            }).clone().wrap('<div/>').parent().html() + "\r\n";
        },

        hrCreate: function () {
            return "<hr />\r\n";
        },

        imageCreate: function (text, elType) {
            var url = prompt("Enter the URL of your image");
            if(!url){
                return "";
            }
            return $('<' + elType + '/>', {
                src: url
            }).clone().wrap('<div/>').parent().html() + "\r\n";
        }
    },

    elementConfigurations: {
        "span": { Text: "This is a span, it holds text", CreateFunction : "genericCreate" },
        "p": { Text: "This is a paragraph, it holds text", CreateFunction : "genericCreate" },
        "a": { Text: "This is an a tag, it can link to another page in your site, or another website." },
        "ol": { Text: ["This is an ordered list", "It can hold as many items as you'd like", "It will number them for you to show that they are in order"], CreateFunction : "listCreate"},
        "ul": { Text: ["This is an unordered list", "It can hold as many items as you'd like", "The items are not ordered"], CreateFunction : "listCreate" },
        "h3": { Text: ["This is a heading on my site"], CreateFunction : "genericCreate" },
        "h2": { Text: ["This is the subtitle of my site"], CreateFunction : "genericCreate" },
        "hr" : { CreateFunction : "hrCreate" },
        "h1": { Text: ["This is the title of my site!"], CreateFunction : "genericCreate" },
        "img": { CreateFunction : "imageCreate" }
    }


};

String.prototype.insert = function (index, string) {
    "use strict";
    if (index > 0) {
        return this.substring(0, index) + string + this.substring(index, this.length);
    }
    return string + this;
};