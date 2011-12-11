(function() {
  var Soulmate;
  Soulmate = window._test.Soulmate;
  describe('Soulmate', function() {
    var renderCallback, selectCallback, soulmate;
    soulmate = renderCallback = selectCallback = null;
    beforeEach(function() {
      renderCallback = function(term, data, type) {
        return term;
      };
      selectCallback = function() {};
      setFixtures(sandbox());
      $('#sandbox').html($('<input type="text" id="search">'));
      return soulmate = new Soulmate($('#search'), {
        url: 'http://example.com',
        types: ['type1', 'type2', 'type3'],
        renderCallback: renderCallback,
        selectCallback: selectCallback,
        minQueryLength: 2,
        maxResults: 5
      });
    });
    describe('#hideContainer', function() {
      it('blurs all the suggestions', function() {
        spyOn(soulmate.suggestions, 'blurAll');
        soulmate.hideContainer();
        return expect(soulmate.suggestions.blurAll).toHaveBeenCalled();
      });
      return it('hides the container', function() {
        soulmate.container.show();
        soulmate.hideContainer();
        return expect(soulmate.container).toBeHidden();
      });
    });
    describe('#showContainer', function() {
      it('shows the container', function() {
        soulmate.container.hide();
        soulmate.showContainer();
        return expect(soulmate.container).toBeVisible();
      });
      describe('#update', function() {
        return describe('with results', function() {
          var update;
          update = function() {
            return soulmate.update({
              "event": [
                {
                  "data": {},
                  "term": "2012 Super Bowl",
                  "id": 673579,
                  "score": 8546.76
                }, {
                  "data": {},
                  "term": "2012 Rose Bowl (Oregon vs Wisconsin)",
                  "id": 614958,
                  "score": 1139.12
                }, {
                  "data": {},
                  "term": "The Book of Mormon - New York",
                  "id": 588497,
                  "score": 965.756
                }
              ],
              "venue": [
                {
                  "data": {},
                  "term": "Opera House (Boston)",
                  "id": 2501,
                  "score": 318.21
                }, {
                  "data": {
                    'url': 'http://www.google.com'
                  },
                  "term": "The Borgata Event Center ",
                  "id": 435,
                  "score": 263.579
                }, {
                  "data": {},
                  "term": "BOK Center",
                  "id": 85,
                  "score": 225.843
                }
              ]
            });
          };
          it('shows the container', function() {
            return expect(function() {
              return update();
            }).toCall(soulmate, 'showContainer');
          });
          return it('shows the new suggestions', function() {
            update();
            return expect(soulmate.container.html()).toMatch(/2012 Super Bowl/);
          });
        });
      });
      return describe('with empty results', function() {
        var update;
        update = function() {
          return soulmate.update({
            "event": [],
            "venue": []
          });
        };
        it('hides the container', function() {
          return expect(function() {
            return update();
          }).toCall(soulmate, 'hideContainer');
        });
        return it('marks the current query as empty', function() {
          return expect(function() {
            return update();
          }).toCall(soulmate.query, 'markEmpty');
        });
      });
    });
    describe('pressing a key down in the input field', function() {
      var keyDown, keyDownEvent;
      keyDown = keyDownEvent = null;
      beforeEach(function() {
        keyDownEvent = $.Event('keydown');
        return keyDown = function(key) {
          var KEYCODES;
          KEYCODES = {
            tab: 9,
            enter: 13,
            escape: 27,
            up: 38,
            down: 40
          };
          keyDownEvent.keyCode = KEYCODES[key];
          return soulmate.input.trigger(keyDownEvent);
        };
      });
      describe('escape', function() {
        return it('hides the container', function() {
          return expect(function() {
            return keyDown('escape');
          }).toCall(soulmate, 'hideContainer');
        });
      });
      describe('tab', function() {
        var tab;
        tab = function() {
          return keyDown('tab');
        };
        it('selects the currently focused selection', function() {
          return expect(tab).toCall(soulmate.suggestions, 'selectFocused');
        });
        return it('prevents the default action', function() {
          return expect(tab).toCall(keyDownEvent, 'preventDefault');
        });
      });
      describe('enter', function() {
        var enter;
        enter = function() {
          return keyDown('enter');
        };
        it('selects the currently focused selection', function() {
          return expect(enter).toCall(soulmate.suggestions, 'selectFocused');
        });
        return it('prevents the default action', function() {
          return expect(enter).toCall(keyDownEvent, 'preventDefault');
        });
      });
      describe('up', function() {
        return it('focuses the previous selection', function() {
          return expect(function() {
            return keyDown('up');
          }).toCall(soulmate.suggestions, 'focusPrevious');
        });
      });
      describe('down', function() {
        return it('focuses the next selection', function() {
          return expect(function() {
            return keyDown('down');
          }).toCall(soulmate.suggestions, 'focusNext');
        });
      });
      return describe('any other key', function() {
        return it('allows the default action to occur', function() {
          return expect(function() {
            return keyDown('a');
          }).not.toCall(keyDownEvent, 'preventDefault');
        });
      });
    });
    return describe('releasing a key in the input field', function() {
      var keyUp;
      keyUp = function() {
        return soulmate.input.trigger('keyup');
      };
      it('sets the current query value to the value of the input field', function() {
        return expect(keyUp).toCallWith(soulmate.query, 'setValue', [soulmate.input.val()]);
      });
      describe('when the query has not changed', function() {
        beforeEach(function() {
          return soulmate.query.hasChanged = function() {
            return false;
          };
        });
        it('should not fetch new results', function() {
          return expect(keyUp).not.toCall(soulmate, 'fetchResults');
        });
        return it('should not hide the container', function() {
          return expect(keyUp).not.toCall(soulmate, 'hideContainer');
        });
      });
      return describe('when the query has changed', function() {
        beforeEach(function() {
          return soulmate.query.hasChanged = function() {
            return true;
          };
        });
        describe('when the query will have results', function() {
          beforeEach(function() {
            return soulmate.query.willHaveResults = function() {
              return true;
            };
          });
          it('should blur the suggestions', function() {
            return expect(keyUp).toCall(soulmate.suggestions, 'blurAll');
          });
          return it('should fetch new results', function() {
            return expect(keyUp).toCall(soulmate, 'fetchResults');
          });
        });
        return describe('when the query will have no results', function() {
          beforeEach(function() {
            return soulmate.query.willHaveResults = function() {
              return false;
            };
          });
          return it('should hide the container', function() {
            return expect(keyUp).toCall(soulmate, 'hideContainer');
          });
        });
      });
    });
  });
}).call(this);
