import { EpubBookm, EpubHtml, EpubItem, EpubNav, EpubNcx, EpubWriter, Link, Section } from 'ebooklib-js';

const book = new EpubBook();

// Add metadata
book.setIdentifier('sample123456');
book.setTitle('Sample book');
book.setLanguage('en');
book.addAuthor('Aleksandar Erkalovic');

// Intro chapter
const c1 = new EpubHtml(null, 'intro.xhtml', '', null, 'Introduction', 'en');
c1.setContent(
	// eslint-disable-next-line max-len
	'<html><head></head><body><h1>Introduction</h1><p>Introduction paragraph where i explain what is happening.</p></body></html>',
);

// About chapter
const c2 = new EpubHtml(null, 'about.xhtml', '', null, 'About this book', 'en');
c2.setContent(
	// eslint-disable-next-line max-len
	'<h1>About this book</h1><p>Hello, this is my book! There are many books, but this one is mine.</p>',
);

// Add chapters to the book
book.addItem(c1);
book.addItem(c2);

// Create table of contents
// - add section
// - add auto created links to chapters
book.toc = [
	new Link('intro.xhtml', 'Introduction', 'intro'),
	[new Section('Languages'), [c1, c2]],
];

// Add navigation files
book.addItem(new EpubNcx());
book.addItem(new EpubNav());

// Define CSS style
const style = `
@namespace epub "http://www.idpf.org/2007/ops";

body {
    font-family: Cambria, Liberation Serif, Bitstream Vera Serif, Georgia, Times, Times New Roman, serif;
}

h2 {
     text-align: left;
     text-transform: uppercase;
     font-weight: 200;     
}

ol {
        list-style-type: none;
}

ol > li:first-child {
        margin-top: 0.3em;
}


nav[epub|type~='toc'] > ol > li > ol  {
    list-style-type:square;
}


nav[epub|type~='toc'] > ol > li > ol > li {
        margin-top: 0.3em;
}
`.trim();

// Add CSS file
const navCSS = new EpubItem('style_nav', 'style/nav.css', 'text/css', style);
book.addItem(navCSS);

// Create spine
book.spine = ['nav', c1, c2];

const epubWriter = new EpubWriter('example1.epub', book, {});
epubWriter.write();
