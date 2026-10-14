import React from 'react';
import {
  KeyboardAvoidingViewProps,
  ModalProps,
  TouchableOpacityProps,
  ViewProps,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';

// RBSheet 2.2.1 does not expose accessibility props for its backdrop or container.
// Adapt its render tree while retaining its modal, animations and drag handling.
class AccessibleBottomSheet extends RBSheet {
  render = () => {
    const modal = super.render() as React.ReactElement<ModalProps>;
    const wrapper = modal.props
      .children as React.ReactElement<KeyboardAvoidingViewProps>;
    const [backdrop, container] = React.Children.toArray(
      wrapper.props.children
    ) as [
      React.ReactElement<TouchableOpacityProps>,
      React.ReactElement<ViewProps>,
    ];

    return React.cloneElement(
      modal,
      {},
      React.cloneElement(
        wrapper,
        {},
        React.cloneElement(backdrop, {
          accessible: false,
          focusable: false,
          accessibilityElementsHidden: true,
          importantForAccessibility: 'no-hide-descendants',
        }),
        React.cloneElement(container, {
          accessible: false,
          accessibilityViewIsModal: true,
        })
      )
    );
  };
}

export default AccessibleBottomSheet;
