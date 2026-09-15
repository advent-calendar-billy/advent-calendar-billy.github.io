/* Tiny markdown renderer for thebilly.dev.
   Supports: headings, paragraphs, bold/italic, inline code, code fences,
   links, images, blockquotes, ul/ol lists, hr, and raw HTML passthrough
   (any line starting with '<' is emitted verbatim, so <video>/<iframe> work). */

function parseFrontMatter(text) {
  var meta = {};
  var body = text;
  var m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (m) {
    m[1].split('\n').forEach(function (line) {
      var i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    body = text.slice(m[0].length);
  }
  return { meta: meta, body: body };
}

function mdToHtml(src) {
  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function inline(s) {
    var out = '';
    var i = 0;
    // protect inline code spans first
    var parts = s.split(/(`[^`]+`)/);
    return parts.map(function (part) {
      if (part.charAt(0) === '`' && part.charAt(part.length - 1) === '`' && part.length > 1) {
        return '<code>' + esc(part.slice(1, -1)) + '</code>';
      }
      var t = esc(part);
      t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
      t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
      t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      t = t.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
      t = t.replace(/(^|[\s(])_([^_\n]+)_/g, '$1<em>$2</em>');
      return t;
    }).join('');
  }

  var lines = src.replace(/\r\n/g, '\n').split('\n');
  var html = [];
  var i = 0;
  while (i < lines.length) {
    var line = lines[i];

    if (/^```/.test(line)) {
      var code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { code.push(lines[i]); i++; }
      i++; // closing fence
      html.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
      continue;
    }

    if (/^\s*$/.test(line)) { i++; continue; }

    // raw HTML passthrough: collect until blank line
    if (/^</.test(line.trim())) {
      var raw = [];
      while (i < lines.length && !/^\s*$/.test(lines[i])) { raw.push(lines[i]); i++; }
      html.push(raw.join('\n'));
      continue;
    }

    var h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      var lvl = h[1].length;
      html.push('<h' + lvl + '>' + inline(h[2]) + '</h' + lvl + '>');
      i++;
      continue;
    }

    if (/^(---|\*\*\*)\s*$/.test(line)) { html.push('<hr>'); i++; continue; }

    if (/^>\s?/.test(line)) {
      var q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
      html.push('<blockquote>' + mdToHtml(q.join('\n')) + '</blockquote>');
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      var items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^[-*]\s+/, '')); i++; }
      html.push('<ul>' + items.map(function (it) { return '<li>' + inline(it) + '</li>'; }).join('') + '</ul>');
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      var oitems = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) { oitems.push(lines[i].replace(/^\d+\.\s+/, '')); i++; }
      html.push('<ol>' + oitems.map(function (it) { return '<li>' + inline(it) + '</li>'; }).join('') + '</ol>');
      continue;
    }

    // paragraph: collect until blank line or block start
    var para = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) &&
           !/^(#{1,4}\s|```|>|[-*]\s|\d+\.\s|<)/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    html.push('<p>' + inline(para.join('\n')) + '</p>');
  }
  return html.join('\n');
}

if (typeof module !== 'undefined') module.exports = { mdToHtml: mdToHtml, parseFrontMatter: parseFrontMatter };
