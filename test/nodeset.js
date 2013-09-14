var xamel = require('../lib/xamel'),
    assert = require('chai').assert,
    xml = require('../lib/xml'),
    NodeSet = xml.NodeSet,
    Tag = xml.Tag,
    Comment = xml.Comment,
    fs = require('fs'),
    test = {};

test['NodeSet (constructor)'] = function() {
    var nset = new NodeSet('Hello,', 'World!'),
        ARRAY = ['Hello,', 'World!'];

    assert.strictEqual(typeof nset, 'object');
    assert.ok(nset instanceof NodeSet);
    assert.deepEqual(nset.childs, ARRAY);
};

test['NodeSet (append)'] = function() {
    var nset = new NodeSet(),
        TEXT = 'hello';

    assert.strictEqual(nset.childs.length, 0);
    nset.append(TEXT);
    assert.strictEqual(nset.childs.length, 1);
    assert.strictEqual(nset.childs[0], TEXT);
};

test['NodeSet (length)'] = function() {
    var nset = new NodeSet(),
        TEXT = 'hello',
        COUNT = parseInt(Math.random() * 100, 10) + 50,
        i = 0;

    assert.strictEqual(nset.length, 0);
    for (; i < COUNT; i++) {
        nset.append(TEXT);
    }
    assert.strictEqual(nset.length, COUNT);
};

test['NodeSet (text)'] = function() {
    var nset = new NodeSet(),
        TEXTS = ['Hello,', 'Brave', 'New', 'World!'];

    nset.append(new Tag('root'));
    TEXTS.forEach(function(text) {
        nset.append(text);
    });
    nset.append(new Comment('Jason Xamel'));

    assert.strictEqual(nset.text(), TEXTS.join(' '));
    assert.deepEqual(nset.text(true), TEXTS);
};

test['NodeSet (toJSON)'] = function() {
    var nset = new NodeSet('Hello,', 'World!');

    assert.strictEqual(JSON.stringify(nset), JSON.stringify(nset.childs));
};

test['NodeSet (toString)'] = function() {
    var nset = new NodeSet('Hello,', 'World!');

    assert.strictEqual(nset.toString(), nset.childs.toString());
};

test['NodeSet (get)'] = function() {
    var nset = new NodeSet(
            new Comment('the'),
            'Hello,',
            new Tag('root'),
            new Comment('wall'),
            new Tag('help'),
            'World!'),
        nsetAll = nset.get('node()'),
        nsetTags = nset.get('*'),
        nsetRootTag = nset.get('root'),
        nsetText = nset.get('text()'),
        nsetComments = nset.get('comment()');

    assert.strictEqual(nsetAll.length, nset.length);
    nsetAll.forEach(function(node, idx) {
        assert.strictEqual(node, nset.childs[idx]);
    });
    assert.strictEqual(nsetTags.length, 2);
    nsetTags.forEach(function(tag) {
            assert.ok(tag instanceof Tag);
        });
    assert.strictEqual(nsetRootTag.length, 1);
    assert.strictEqual(nsetRootTag.childs[0].name, 'root');
    assert.strictEqual(nsetText.length, 2);
    assert.strictEqual(nsetText.join(' '), 'Hello, World!');
    nsetText.forEach(function(text) {
            assert.ok(typeof text === 'string');
        });
    assert.strictEqual(nsetComments.length, 2);
    assert.strictEqual(nsetComments.join(' '), 'the wall');
    nsetComments.forEach(function(comment) {
            assert.ok(comment instanceof Comment);
        });
};

test['NodeSet (find)'] = function(done) {
    var xmlSource = fs.readFileSync('./test/data/simple.xml', 'utf8');

    // @todo improve this test
    xamel.parse(xmlSource, { trim : true }, function(error, xml) {
        assert.strictEqual(error, null);

        assert.strictEqual(
            xml.find('menu/food/name/text()').join(', '),
            [   'Belgian Waffles',
                'Strawberry Belgian Waffles',
                'Berry-Berry Belgian Waffles',
                'French Toast',
                'Homestyle Breakfast' ].join(', ')
            );

        assert.strictEqual(
            xml.$('menu/food/name/text()'),
            [   'Belgian Waffles',
                'Strawberry Belgian Waffles',
                'Berry-Berry Belgian Waffles',
                'French Toast',
                'Homestyle Breakfast' ].join(' ')
        );

        done();
    });
};

/**
 * @param {NodeSet} nset
 * @param {Number} count of children to generate
 * @param {Function} generator (index, nset) returns node
 */
function generateChildren(nset, count, generator) {
    var i = 0;

    for (; i < count; i++) {
        nset.append(generator(i, nset));
    }
}

test['NodeSet (explode)'] = function() {
    var nset = new NodeSet(
                'Hello',
                'World',
                new Comment('test'),
                new Tag('xxx')
            ),
        tag = new Tag('comments'),
        nsetExploded;

    generateChildren(tag, 100, function(i) {
        return new Tag('comment', { id : i }, tag);
    });

    nsetExploded = nset.append(tag).explode();

    assert.strictEqual(nsetExploded.length, tag.length);

    nsetExploded.forEach(function(child, idx) {
        assert.strictEqual(child, tag.childs[idx]);
    });
};

test['NodeSet (hasAttr)'] = function() {
    var TAG_ONE = 'one',
        TAG_TWO = 'two',
        nset = new NodeSet(
            new Tag(TAG_ONE, { one : 'true' }),
            new Tag(TAG_TWO, { two : 'true' })),
        nsetOne = nset.hasAttr('one'),
        nsetTwo = nset.hasAttr('two');

    assert.strictEqual(nsetOne.length, 1);
    assert.strictEqual(nsetTwo.length, 1);

    assert.strictEqual(nsetOne.childs[0].name, TAG_ONE);
    assert.strictEqual(nsetTwo.childs[0].name, TAG_TWO);
};

test['NodeSet (isAttr)'] = function() {
    var TAG_ONE = 'one',
        TAG_TWO = 'two',
        nset = new NodeSet(
                new Tag(TAG_ONE, { id : 1 }),
                new Tag(TAG_TWO, { id : 2 })),
        nsetOne = nset.isAttr('id', 1),
        nsetTwo = nset.isAttr('id', 2);

    assert.strictEqual(nsetOne.length, 1);
    assert.strictEqual(nsetTwo.length, 1);

    assert.strictEqual(nsetOne.childs[0].name, TAG_ONE);
    assert.strictEqual(nsetTwo.childs[0].name, TAG_TWO);
};

test['NodeSet (eq)'] = function() {
    var nset = new NodeSet();

    generateChildren(nset, 100, function(i) {
        return new Tag('tag-' + i);
    });

    assert.strictEqual(nset.eq(50).name, 'tag-50');
};

module.exports = test;
