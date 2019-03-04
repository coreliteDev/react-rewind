// function parser() {
const esprima = require('esprima');
const estraverse = require('estraverse');
const escodegen = require('escodegen');
const _ = require('lodash');

// declare functions to insert
// TODO: Un-comment timeTravelTracker
function useReducerReplacement() {
  const dispatcher = resolveDispatcher();
  function reducerWithTracker(state, action) {
    const newState = reducer(state, action);
    //  timeTravelTracker[timeTravelTracker.length - 1].actionDispatched = true;
    window.postMessage({
      type: 'DISPATCH',
      data: {
        state: newState,
        action,
      },
    });
    return newState;
  }
  return dispatcher.useReducer(reducerWithTracker, initialArg, init);
}
function commitAllHostEffectsReplacement() {
  while (nextEffect !== null) {
    {
      setCurrentFiber(nextEffect);
    }
    recordEffect();

    let {effectTag} = nextEffect;

    if (effectTag & ContentReset) {
      commitResetTextContent(nextEffect);
    }

    if (effectTag & Ref) {
      let current$$1 = nextEffect.alternate;
      if (current$$1 !== null) {
        commitDetachRef(current$$1);
      }
    }

    // The following switch statement is only concerned about placement,
    // updates, and deletions. To avoid needing to add a case for every
    // possible bitmap value, we remove the secondary effects from the
    // effect tag and switch on that value.
    let primaryEffectTag = effectTag & (Placement | Update | Deletion);
    switch (primaryEffectTag) {
      case Placement:
      {
        // editbyme
        window.postMessage({
          type: 'EFFECT',
          data: {
            primaryEffectTag: 'PLACEMENT',
            effect: _.cloneDeep(nextEffect),
          },
        });

        commitPlacement(nextEffect);
        // Clear the "placement" from effect tag so that we know that this is inserted, before
        // any life-cycles like componentDidMount gets called.
        // TODO: findDOMNode doesn't rely on this any more but isMounted
        // does and isMounted is deprecated anyway so we should be able
        // to kill this.
        nextEffect.effectTag &= ~Placement;
        break;
      }
      case PlacementAndUpdate:
      {
        // Placement
        commitPlacement(nextEffect);
        // Clear the "placement" from effect tag so that we know that this is inserted, before
        // any life-cycles like componentDidMount gets called.
        nextEffect.effectTag &= ~Placement;

        // Update
        let _current = nextEffect.alternate;
        commitWork(_current, nextEffect);
        break;
      }
      case Update:
      {
        // editbyme
        window.postMessage({
          type: 'EFFECT',
          data: {
            primaryEffectTag: 'UPDATE',
            effect: _.cloneDeep(nextEffect),
            current: _.cloneDeep(nextEffect.alternate),
          },
        });

        let _current2 = nextEffect.alternate;
        commitWork(_current2, nextEffect);
        break;
      }
      case Deletion:
      {
        // editbyme
        window.postMessage({
          type: 'EFFECT',
          data: {
            primaryEffectTag: 'DELETION',
            effect: _.cloneDeep(nextEffect),
          },
        });

        commitDeletion(nextEffect);
        break;
      }
    }
    nextEffect = nextEffect.nextEffect;
  }

  {
    resetCurrentFiber();
  }
}

// traverse ast to find method and replace body with our node's body
function traverseTree(replacementNode, functionName, ast) {
  estraverse.replace(ast, {
    enter(node) {
      if (node.type === 'FunctionDeclaration') {
        if (node.id.name === functionName) {
          node.body = replacementNode.body[0].body;
        }
      }
    },
  });
}

const parseAndGenerate = (codeString) => {
  if (codeString.search('react')) {
    const ast = esprima.parseModule(codeString);
    // parse react-dom code
    if (codeString.search('react-dom') !== -1) {
      const injectableCommitAllHostEffects = esprima.parseScript(commitAllHostEffectsReplacement.toString());
      traverseTree(injectableCommitAllHostEffects, 'commitAllHostEffects', ast);
    } else {
      // parse react code
      const injectableUseReducer = esprima.parseScript(useReducerReplacement.toString());
      traverseTree(injectableUseReducer, 'useReducer', ast);
    }
    const code = escodegen.generate(ast);
    return code;
  }
  return -1;
};

// }
module.exports = parseAndGenerate;
