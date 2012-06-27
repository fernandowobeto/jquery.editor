(function($){ 
  $.fn.wobetoEditor=function(options){
    var d={
      toolbars:[['bold','italic','underline','separator','justify','left','center','right','separator','fontsize','fontfamily','separator','fontcolor','highlight']],  // Buttons
      output:'xhtml',  // Output
      css:'body{margin:3px;font-family:verdana;font-size:11px;}p{margin:0px;}',
      success:function(data){
        alert(data);
      }, // AJAX on success
      error:function(a,b,c){
        return this;
      }   // AJAX on error
    };
    d = $.extend(d, options);
       
    var get_selection = function(){
      var range;
      if($.browser.msie){
        range = d.iframe.contentWindow.document.selection.createRange();
        if (range.htmlText && range.text){
          return range.htmlText;
        }
      }else{
        if (d.iframe.contentWindow.getSelection) {
          var selection = d.iframe.contentWindow.getSelection();
          if (selection.rangeCount>0&&window.XMLSerializer){
            range=selection.getRangeAt(0);
            var html=new XMLSerializer().serializeToString(range.cloneContents());
            return html;
          }
          if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            var clonedSelection = range.cloneContents();
            var div = document.createElement('div');
            div.appendChild(clonedSelection);
            return div.innerHTML;
          }
        }
      }
    };

    var in_array=function(o,a){
      for (var i in a){
        if((i===o)){
          return true;
        }
      }
      return false;
    };

    var insert_text = function(text,start,end){
      if($.browser.msie){
        d.iframe.contentWindow.focus();
        if(typeof d.idoc.selection !== "undefined" && d.idoc.selection.type !== "Text" && d.idoc.selection.type !== "None"){
          start = false;
          d.idoc.selection.clear();
        }
        var sel = d.idoc.selection.createRange();
        sel.pasteHTML(text);
        if (text.indexOf("\n") === -1) {
          if (start === false) {} else {
            if (typeof start !== "undefined") {
              sel.moveStart("character", - text.length + start);
              sel.moveEnd("character", - end);
            } else {
              sel.moveStart("character", - text.length);
            }
          }
          sel.select();
        }
      }else{
        d.idoc.execCommand("insertHTML", false, text);
      }
      
      // Updating the textarea component, so whenever it is posted it will send all the data
      if ($("#"+d.id).is(":visible") === false) {
        var html = $("#1"+d.id).is(":visible")?$("#"+d.id).val():html = d.iframe.contentWindow.document.body.innerHTML;		    
        html = (typeof getXHTML === 'function')?getXHTML(html):html;
        $("#"+d.id).val(html);
        if(undefined!==d.change){
          d.change();
        }
      }		
    };

    var keyup = function(e){
      // Updating the textarea component, so whenever it is posted it will send all the data
      var html = $("#1"+d.id).is(":visible")?$("#"+d.id).val():html = d.iframe.contentWindow.document.body.innerHTML;
      html = (typeof getXHTML === 'function')?getXHTML(html):html;
      $("#"+d.id).val(html);
      if(undefined!==d.change){
        d.change();
      }
    };

    var style = function(){       
      if( d.idoc.createStyleSheet) {
        d.idoc.createStyleSheet().cssText=d.css;
      }else {
        var css=d.idoc.createElement('link');
        css.rel='stylesheet';
        css.href='data:text/css,'+escape(d.css);
        if($.browser.opera){
          d.idoc.documentElement.appendChild(css);
        }else{
          d.idoc.getElementsByTagName("head")[0].appendChild(css);
        }
      }
    // END: HtmlBox Style
    };    
    
    // Commands
    var cmds = {
      "bold":"Negrito",
      "center":"Alinha Centro",
      "code":"Ver Código",
      "copy":"Copiar",
      "cut":"Recortar",
      "hr":"Inserir Linha",
      "link":"Inserir Link",
      "image":"Inserir Imagem",
      "indent":"Parágrafo",
      "italic":"Itálico",
      "justify":"Justificar",
      "left":"Alinhar Esquerda",
      "ol":"Lista Numerada",
      "outdent":"Recuar Parágrafo",
      "paragraph":"Inserir Parágrafo",
      "paste":"Colar",
      "quote":"Citação",
      "redo":"Refazer",
      "removeformat":"Remover Formatação",
      "right":"Alinhar Direita",
      "strike":"Rasurado",
      "striptags":"Retirar Tags",
      "sub":"Subscrito",
      "sup":"Sobrescrito",
      "ul":"Lista",
      "underline":"Sublinhado",
      "undo":"Desfazer",
      "unlink":"Remover Link"
    };    

    var toolbar=function(){
      var h = "";
      for(var k=0;k<d.toolbars.length;k++){
        var toolbar = d.toolbars[k];      
        h += '<div class="linha_botoes">';
        for(var i=0;i<(toolbar.length);i++){
          if(undefined===toolbar[i]){
            continue;
          }else if(toolbar[i]==="separator"){
            h += '<div class="ewd_separator"><div class="separator"></div></div>';
          }else if(toolbar[i]==="fontsize"){
            h += "<div class='selects'><select id='"+d.id+"_fontsize' onchange='global_hb[\""+d.id+"\"].cmd(\"fontsize\",this.options[this.selectedIndex].value)' style='font-size:12px;'><option value='' selected>TAMANHO</option><option value='1'>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option><option value='5'>5</option><option value='6'>6</option><option value='7'>7</option></select></div>";
          }else if(toolbar[i]==="fontfamily"){
            h += "<div class='selects'><select id='"+d.id+"_fontfamily' onchange='global_hb[\""+d.id+"\"].cmd(\"fontname\",this.options[this.selectedIndex].value)' style='font-size:12px;'><option value='' selected>FONTES</option><option value='arial' style='font-family:arial;'>Arial</option><option value='courier' style='font-family:courier;'>Courier</option><option value='cursive' style='font-family:cursive;'>Cursive</option><option value='georgia' style='font-family:georgia;'>Georgia</option><option value='monospace' style='font-family:monospace;'>Monospace</option><option value='tahoma' style='font-family:tahoma;'>Tahoma</option><option value='verdana' style='font-family:verdana;'>Verdana</option></select></div>";
          }else if(toolbar[i]==="formats"){
            h += "<div class='selects'><select id='"+d.id+"_formats' onchange='global_hb[\""+d.id+"\"].cmd(\"format\",this.options[this.selectedIndex].value)' style='font-size:12px;'><option value='' selected>FORMATOS</option><option value='h1'>Titulo 1</option><option value='h2'>Titulo 2</option><option value='h3'>Titulo 3</option><option value='h4'>Titulo 4</option><option value='h5'>Titulo 5</option><option value='h6'>Titulo 6</option><option value='p'>Paragrafo</option><option value='pindent'>Primeiro Paragrafo</option><option value='pre'>Pre-formatado</option></select></div>";
          }else if(toolbar[i]==="fontcolor"){
            h += '<div id="'+d.id+'_fontcolor" class="ewd" title="Cor da Fonte"><div class="ewd_interna fontcolor"></div></div>';
          }else if(toolbar[i]==="highlight"){
            h += '<div id="'+d.id+'_highlight" class="ewd" title="Cor de Fundo"><div class="ewd_interna highlight"></div></div>';
          }else if(toolbar[i]==="emoticons"){
            h += '<div id="'+d.id+'_emoticons" class="ewd" title="Emoticons"><div class="ewd_interna emoticons"></div></div>';
          }
          
          if(in_array(toolbar[i],cmds)){
            h += '<div class="ewd" onclick="global_hb[\''+d.id+'\'].cmd(\''+toolbar[i]+'\')" title="'+cmds[toolbar[i]]+'"><div class="ewd_interna '+toolbar[i]+'"></div></div>';
          }
        }
        h += "</div>";
      }
      return h;
    };

    this.wrap_tags = function(start,end){
      var sel = get_selection(); 
      if(undefined===sel){
        sel="";
      }
      if(undefined===end){
        end="";
      }
      insert_text(start+sel+end,start.length,end.length);
    };

    this._init = function(is_init){
      if(undefined===window.global_hb){
        global_hb=[];
      }
      if(!$(this).attr("id")){
        $(this).attr("id","jqhb_"+global_hb.length);
        d.id="jqhb_"+global_hb.length;
        global_hb[d.id]=global_hb;
      }else{
        d.id=$(this).attr("id");
      }
      if(undefined === global_hb[d.id]){
        global_hb[d.id]=this;
      }
      d.ta_wrap_id = d.id+"_wrap";
    
      var w=$(this).css("width");
      var h=$(this).css("height");
    
      var editor = $('<div></div>').attr({
        id:d.id+'_wrap'
        }).addClass('editor_wobeto_div').css({
        width:w
      });    
      var conteudo = $('<div></div>').attr({
        id:d.id+'_container'
        }).css({
        height:h
      }).appendTo(editor);
      $(this).wrap(editor);
        
      // START: Appending toolbar
      $(this).parent().parent().prepend(toolbar());     
      
      
      //ADICIONA PALETA DE CORES
      var colorList = {0 : '00',1 : '33',2 : '66',3 :'99',4 : 'CC',5 : 'FF'};
      
      var colorItems = $('<div></div>').addClass('paleta_cores').insertAfter('div.fontcolor');                 
      for(var r in colorList){
        for(var b in colorList){
          for(var g in colorList){
            var colorCode = '#'+colorList[r]+colorList[g]+colorList[b];
            var colorSquare = $('<div></div>').css({'cursor' : 'pointer', 'height' : '15px', 'float' : 'left'}).appendTo(colorItems);
            var colorBorder = $('<div></div>').attr({title:colorCode}).css({border: '2px solid '+colorCode}).mouseover(function(){$(this).css({border:'2px solid black'})}).mouseout(function(){$(this).css({border:'2px solid '+$(this).attr('title')})}).appendTo(colorSquare);
            var colorInner = $('<div></div>').css({backgroundColor:colorCode,overflow:'hidden',width:'11px',height:'11px'}).appendTo(colorBorder).click(function(){
              global_hb[d.id].cmd('fontcolor',$(this).css('backgroundColor'));
              $(document).unbind('click');
            });
          }	
        }	
      }
      
      $('#'+d.id+'_fontcolor').click(function(){
        $('div.paleta_fundos,div.paleta_emoticons').hide();
        $(document).unbind('click');
        setTimeout(function(){ // Delay for Mozilla
          $(document,'#'+d.id+'_html').bind('click',function(){
            $(document,'#'+d.id+'_html').unbind('click');
            paleta.fadeOut();
            return false;
          });
        },0);        
        
        paleta = $(this).find('div.paleta_cores');
        status_paleta = paleta.css('display');
        if(status_paleta=='block'){
          paleta.hide();          
        }else{
          paleta.show();
        }
      });
      
      var paleta_fundos = $('<div></div>').addClass('paleta_fundos').insertAfter('div.highlight');                 
      for(var r in colorList){
        for(var b in colorList){
          for(var g in colorList){
            var colorCode = '#'+colorList[r]+colorList[g]+colorList[b];
            var colorSquare = $('<div></div>').css({'cursor' : 'pointer', 'height' : '15px', 'float' : 'left'}).appendTo(paleta_fundos);
            var colorBorder = $('<div></div>').attr({title:colorCode}).css({border: '2px solid '+colorCode}).mouseover(function(){$(this).css({border:'2px solid black'})}).mouseout(function(){$(this).css({border:'2px solid '+$(this).attr('title')})}).appendTo(colorSquare);
            var colorInner = $('<div></div>').css({backgroundColor:colorCode,overflow:'hidden',width:'11px',height:'11px'}).appendTo(colorBorder).click(function(){
              global_hb[d.id].cmd('backcolor',$(this).css('backgroundColor'));
              $(document).unbind('click');
            });
          }	
        }	
      }
      
      //ADICIONA PALETA DE EMOTICONS
      var array_emot = {0:'biggrin',1:'unsure',2:'wink',3:'wacko',4:'tongue',5:'smile',6:'sad',7:'rolleyes',8:'mellow',9:'ohmy',10:'laugh',11:'huh',12:'blink',13:'blush',14:'cool',15:'dry',16:'happy',17:'excl'};
      
      var emotItems = $('<div></div>').addClass('paleta_emoticons').insertAfter('div.emoticons');                 
      for(var r in array_emot){
        var emoticons = $('<div></div>').attr({title:array_emot[r]}).addClass(array_emot[r]).appendTo(emotItems).click(function(){
          global_hb[d.id].cmd('emoticons',$(this).attr('title'));
        });
      }     
            
      var click_frame = function(){
        $(document).unbind('click');
        $('div.paleta_cores').fadeOut();
        $('div.paleta_fundos').fadeOut();
        $('div.paleta_emoticons').fadeOut();
      }
            
      $('#'+d.id+'_highlight').click(function(){
        $('div.paleta_cores,div.paleta_emoticons').hide();
        $(document).unbind('click');
        setTimeout(function(){ // Delay for Mozilla   
          $(document,'#'+d.id+'_html').bind('click',function(){
            $(document,'#'+d.id+'_html').unbind('click');
            paleta.fadeOut();
            return false;
          });
        }, 0);
        
        paleta = $(this).find('div.paleta_fundos');
        status_paleta = paleta.css('display');
        if(status_paleta=='block'){
          paleta.hide();
        }else{
          paleta.show();
        }        
      });
      
      $('#'+d.id+'_emoticons').click(function(){
        $('div.paleta_fundos,div.paleta_cores').hide();
        $(document).unbind('click');
        setTimeout(function(){ // Delay for Mozilla
          $(document,'#'+d.id+'_html').bind('click',function(){
            $(document,'#'+d.id+'_html').unbind('click');
            paleta.fadeOut();
            return false;
          });
        },0); 
                
        paleta = $(this).find('div.paleta_emoticons');
        status_paleta = paleta.css('display');
        if(status_paleta=='block'){
          paleta.hide();
        }else{
          paleta.show();
        }         
      });
      
      
      // START: Skin		
      $("#"+d.id+"_wrap").css("border","1px solid #7F7647");
      $("#"+d.id+"_wrap").css("background","#DFDDD1");
      $("#"+d.id+"_container").css("background","white");
		
      try {
        var iframe=document.createElement("IFRAME");// var doc=null;
      
        $(iframe).attr({
          id:d.id+"_html"
          }).css({
          border:"0",
          width:"100%",
          height:"100%",
          display:"block"
        });
        $(this).parent().prepend(iframe);
        // START: Shortcuts for less code
        d.iframe = iframe;
        d.idoc = iframe.contentWindow.document;
        // END: Shortcuts
		   
        d.idoc.designMode="on";
        // START: Insert text
        // Is there text in the textbox?
        var text = ($(this).val()==="")?"":$(this).val();
        if($.browser.mozilla||$.browser.safari){
          //if(text===""){text="&nbsp;";}
          d.idoc.open('text/html', 'replace');
          d.idoc.write(text);
          d.idoc.close();
        }else{
          if(text!==""){
            d.idoc.write(text);
          }
          else{
            // Needed by IE to initialize the iframe body
            if($.browser.msie){
              d.idoc.write("&nbsp;");
            }
          }
        }
        // Needed by browsers other than MSIE to become editable
        if($.browser.msie===false){
          iframe.contentWindow.document.body.contentEditable = true;
        }
        // END: Insert text		   
        if(d.idoc.createStyleSheet) {
          setTimeout("global_hb['"+d.id+"'].set_text(global_hb['"+d.id+"'].get_html())",10);
        }else {
          style();
        }

        if(iframe.contentWindow.document.attachEvent){
          iframe.contentWindow.document.attachEvent("onkeyup", keyup);
          iframe.contentWindow.document.attachEvent("onclick", click_frame);
        }else{
          iframe.contentWindow.document.addEventListener("keyup",keyup,false);
          iframe.contentWindow.document.addEventListener("click",click_frame,false);
        }
        $(this).hide();        
      }catch(e){
        alert("This rich text component is not supported by your browser.\n"+e);
        $(this).show();
      }
      return this;
    };    

    this.cmd = function(cmd,arg1){
      // When user clicks toolbar button make sure it always targets its respective WYSIWYG
      d.iframe.contentWindow.focus();
      // START: Prepare commands
      if(cmd==="paragraph"){
        cmd="format";
        arg1="p";
      }
      var cmds = {
        "center":"justifycenter",
        "hr":"inserthorizontalrule",
        "justify":"justifyfull",
        "left":"justifyleft",
        "ol":"insertorderedlist",
        "right":"justifyright",
        "strike":"strikethrough",
        "sub":"subscript",
        "sup":"superscript",
        "ul":"insertunorderedlist"
      };
      if(in_array(cmd,cmds)){
        cmd=cmds[cmd];
      }
      // END: Prepare commands
      if(cmd==="code"){
        var text = this.get_html();
        if($("#"+d.id).is(":visible")){		       
          $("#"+d.id).hide();		   
          $("#"+d.id+"_html").show();
          this.set_text(text);
        }else{
          $("#"+d.id).show();
          $("#"+d.id+"_html").hide();
          this.set_text(text);
          $("#"+d.id).focus();
        }		   
      }else if(cmd==="link"){
        $link = prompt("Coloque o endereco da URL aqui:");
        if($link){
          d.idoc.execCommand("createlink", false,$link);
        }
      }else if(cmd==="image"){
        $imagem = prompt("Coloque o endereco URL da imagem aqui:");
        if($imagem){
          d.idoc.execCommand("insertimage", false,$imagem);
        }        
      }else if(cmd==="fontsize"){
        d.idoc.execCommand(cmd, false,arg1);
      }else if(cmd==="backcolor"){
        if($.browser.msie){
          d.idoc.execCommand("backcolor", false,arg1);
        }else{
          d.idoc.execCommand("hilitecolor", false,arg1);
        }
      }else if(cmd==="fontcolor"){
        d.idoc.execCommand("forecolor", false,arg1);
      }
      else if(cmd==="fontname"){
        d.idoc.execCommand(cmd, false, arg1);
      }else if(cmd==="cut"){
        if($.browser.msie === false){
          alert("Disponível somente no IE.\nUse CTRL+X para recortar texto!");
        }
        else{
          d.idoc.execCommand('Cut');
        }
      }else if(cmd==="copy"){
        if($.browser.msie === false){
          alert("Disponível somente no IE.\nUse CTRL+C paracopiar texto!");
        }else{
          d.idoc.execCommand('Copy');
        }
      }else if(cmd==="paste"){
        if($.browser.msie === false){
          alert("Disponível somente no IE.\nUse CTRL+V para colar texto!");
        }else{
          d.idoc.execCommand('Paste');
        }
      }else if(cmd==="format"){
        if(arg1==="pindent"){
          this.wrap_tags('<p style="text-indent:20px;">','</p>');
        }
        else if(arg1!==""){
          d.idoc.execCommand('formatBlock', false, "<"+arg1+">");
        }
      }else if(cmd==="striptags"){
        var sel = get_selection();
        sel = sel.replace(/(<([^>]+)>)/ig,"");
        insert_text(sel); 
      }else if(cmd==="quote"){
        this.wrap_tags('<br><div style="width:100px;position:relative;top:10px;left:10px;font-size:11px;font-family:verdana;"><b>Citacao</b></div><div class="quote" contenteditable="true" style="border:1px inset silver;margin:10px;padding:5px;background:#EFF7FF;">','</div><br />');
      }else if(cmd==="emoticons"){
        this.wrap_tags('<img src="images/emoticons/'+arg1+'.gif">','');
      }else{
        d.idoc.execCommand(cmd, false, null);
      }
      //Setting the changed text to textearea
      if($("#"+d.id).is(":visible")===false){
        $("#"+d.id).val(this.get_html());
        // Register change
        if(undefined!==d.change){
          d.change();
        }
      }
    };

    this.get_text = function(){
      // Is textbox visible?
      if($("#"+d.id).is(":visible")){
        return $("#"+d.id).val();
      }
      // Iframe is visible
      var text;
      if($.browser.msie){
        text = d.iframe.contentWindow.document.body.innerText;
      }else{
        var html = d.iframe.contentWindow.document.body.ownerDocument.createRange();
        html.selectNodeContents(d.iframe.contentWindow.document.body);
        text = html;
      }
      return text;
    };

    this.set_text = function(txt){
      var text = (undefined===txt)?"":txt;
      if(text==="" && $.browser.safari){
        text = "&nbsp;";
      }// Bug in Chrome and Safari
      // Is textarea visible? Writing to it.
      if($("#"+d.id).is(":visible")){
        $("#"+d.id).val(text);
      }else{
        // Textarea not visible. write to iframe
        if($.browser.mozilla||$.browser.safari){
          //if($.trim(text)===""){text="&nbsp;";}
          d.idoc.open('text/html', 'replace');
          d.idoc.write(text);
          d.idoc.close();
        }else{
          d.idoc.body.innerHTML = "";
          if(text!==""){
            d.idoc.write(text);
          }
        }
        style(); // Setting the CSS style for the iframe
        d.idoc.body.contentEditable = true;
		 
      }
      if(undefined!==d.change){
        d.change();
      }
      return this;
    };

    this.get_html = function(){
      var html;
      if($("#"+d.id).is(":visible")){
        html = $("#"+d.id).val();
      }else{
        html = d.iframe.contentWindow.document.body.innerHTML;
      }
      if(typeof getXHTML === 'function'){
        return getXHTML(html);
      }else{
        return html;
      }
    };

    this.change=function(fn){
      d.change=fn;
      return this;
    };

    this.remove = function(){
      global_hb[d.id]=undefined;
      $("#"+d.id+"_wrap").remove();
    };
    this.post=function(url,data){
      if(undefined===data){
        data=this.get_html();
      }
      data=(d.id+"="+data);
      $.ajax({
        type: "POST", 
        data: data,
        url: url,
        dataType: "html",
        error:d.error,
        success:d.success
      });
    };
    this.get=function(url,data){
      if(undefined===data){
        data=this.get_html();
      }
      data=(d.id+"="+data);
      $.ajax({
        type: "GET", 
        data: data,
        url: url,
        dataType: "html",
        error:d.error,
        success:d.success
      });
    };
    this.success=function(fn){
      d.success=fn;
      return this;
    };
    this.error=function(fn){
      d.error=fn;
      return this;
    };
    this._init(false);
    return this;
  };
})(jQuery);