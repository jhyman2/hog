'use strict';

describe('list sub-state', function () {

  beforeEach(function () {
    browser.get('');
  });

  it('should have a basic content', function () {
    expect(element.all(by.css('div')).first().getText()).toBe('ListComplexCtrl');
  });

});
