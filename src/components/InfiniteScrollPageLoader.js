import React from 'react'

function createScrollIntoViewSubscription(element, listener) {
  const scrollDetector = () => {
    if (!element.isConnected) {
      unsubscribe();
      return;
    }

    if (isAlmostVisible(element, 50)) {
      listener();
    }
  };

  const unsubscribe = () => {
    window.removeEventListener("scroll", scrollDetector);
  };

  window.addEventListener("scroll", scrollDetector);
  return unsubscribe;
}

function isAlmostVisible(el, delta) {
  const rect = el.getBoundingClientRect();
  const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
  const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

  const vertInView = (rect.top - delta <= windowHeight) && ((rect.top - delta + rect.height) >= 0);
  const horInView = (rect.left - delta <= windowWidth) && ((rect.left - delta + rect.width) >= 0);

  return vertInView && horInView;
}

class InfiniteScrollPageLoader extends React.Component {
  constructor(props) {
    super(props);
    this.triggerRef = React.createRef();
  }

  componentDidMount() {
    this._unsubscribe = createScrollIntoViewSubscription(
      this.triggerRef.current, () => {
        this.props.onLoadMore();
    });
  }

  componentWillUnmount() {
    this._unsubscribe && this._unsubscribe();
    this._unsubscribe = null;
  }

  render() {
    return (
      <button
        ref={this.triggerRef}
        onClick={() => this.props.onLoadMore()}
        title="Load More">
        Load more
      </button>
    )
  }
}

export default InfiniteScrollPageLoader;