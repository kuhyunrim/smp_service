<script src="../../assets/js/lib/lib.min.js"></script>
<script src="../../dashboard/highlight.pack.js"></script>
<script src="../../assets/js/common.js"></script>
<script>
  const encodeHTML = (str) => {
    return str.replace(/[\u00A0-\u9999<>&](?!#)/gim, (i) => {
      return '&#' + i.charCodeAt(0) + ';';
    });
  }
  /*
  $('pre code').each((i, el) => {
   const html = $(el).html()
    const result = encodeHTML(html)
    $(el).html(result)
  })
  */

  const testData = [
    { id: 0, text: 'enhancement' },
    { id: 1, text: 'bug' },
    { id: 2, text: 'duplicate' },
    { id: 3, text: 'invalid' },
    { id: 4, text: 'wontfix' }
  ];

  hljs.initHighlightingOnLoad();

  $('#testEvent').on('select2:select', function (e) {
    var data = e.params.data;
    console.log(data);
  });
  $('#testAjax').select2({
    data: testData
  })
</script>
