
/**
 * @fileoverview Custom functionality to apply throughout every adsize. This
 * has a dependency on common.js and utils.js
 */
var custom = (function() {

  /**
   * Classes which our JS hooks into. Add more class names as necessary.
   * @enum
   * @private
   */
  var elementClass_ = {
    item: 'js-item',
    itemName: 'js-item-name',
    itemPrice: 'js-item-price',
    itemSalePrice: 'js-item-saleprice',
    itemRegularPrice: 'js-item-regularprice',
    itemBorder: 'js-item-border',
    itemDetails: 'js-item-details'
  };

  var elementId_ = {
    gpaDataProvider: 'gpa-data-provider'
  };

  /**
   * Initialization. Called from handleAdInitialized on each page.
   */
  function init() {
    utils.log('custom.init()');
    var data = common.getAdData();
    if (!data) return;
    items = document.querySelectorAll('.' + elementClass_.item);

    // If you're using the swipe gallery to display feed items.
    //initItemsUsingGallery_();

    // If you're NOT using the swipe gallery to display feed items.
    initItemsWithoutGallery_();

    setAutoCycle();
  }


  // Manipulate 'Price Discount Percentage' from a fraction to whole number & more
  function transformDynamicData () {
     console.log("transformDynamicData");
     var dataProvider = document.querySelector('#' + elementId_.gpaDataProvider);
     console.log("data: " + dataProvider);
     dataProvider.addDataTransformer(function(dynamicData) {
       var aryProducts = dynamicData.Product;
       if(!aryProducts) return;
       for(var i = 0; i < aryProducts.length; i++ ){
         var discountData = aryProducts[i].salePercentDiscount;
         if (discountData != null && discountData > 0 && discountData < 1) {
           var discountText = "-" + Math.round(discountData * 100) + "%";
           aryProducts[i].salePercentDiscount = discountText;
         }
       }
     });
   }

   /**
   * Auto cycle through items on stage.
   */
  var autoCycleInt;
  var cancelTimeout;
  function setAutoCycle() {
    var itemsLength = Math.min(items.length, common.getAdData().Product.length);

    // Set first item active.
    activateCurrentItem();

    // Start auto cycle.
    var autoCycleFrameDur = 2000;
    autoCycleInt = setInterval(function() {
      if (common.getCurrentItemIndex() < itemsLength - 1) {
        common.setCurrentItemNext();
      } else {
        common.setCurrentItemIndex(0);
      }

      activateCurrentItem();
    }, autoCycleFrameDur);

    // Limit to 30 seconds.
    var autoCycleLimit = 28000;
    cancelTimeout = setTimeout(function() {
      stopAutoCycle();
      common.setCurrentItemIndex(0);
      activateCurrentItem();
    }, autoCycleLimit);
  }

  function activateCurrentItem() {
    var index = common.getCurrentItemIndex();
    var item = items[index];
    itemHighlight(item);
  }

  /**
   * Stops the autocycle interval.
   */
  function stopAutoCycle() {
    console.log("stopAutoCycle");
    clearInterval(autoCycleInt);
    clearTimeout(cancelTimeout);
  }

  /**
   * Highlight item (replaces mouseOver)
   */
  function itemHighlight(item) {
    var adData = common.getAdData();
    var itemDetails = item.querySelector('.' + elementClass_.itemDetails);
    var itemBorder = item.querySelector('.' + elementClass_.itemBorder);
    itemDetails.style.opacity = 1;
    itemBorder.style.opacity = 1;

    // Revert other items.
    for (var i = 0; i < items.length; i++) {
      var current = items[i];
      if (item != current) {
        itemMouseOut(current);
      }
    }
  }

  /**
   * un-highlight item (replaces mouseOut)
   */
  function itemUnHighlight(item) {
    var itemDetails = item.querySelector('.' + elementClass_.itemDetails);
    var itemBorder = item.querySelector('.' + elementClass_.itemBorder);
    itemDetails.style.opacity = 0;
    itemBorder.style.opacity = 0;
  }

  /**
   * Find all items used in the swipe gallery and initialize custom behavior.
   * @private
   */
  function initItemsUsingGallery_() {
    var gallery = common.getGallery();

    // Apply settings to each item in the gallery
    var items = gallery.querySelectorAll('.' + elementClass_.item);
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      initItemDisplay_(item);
    }
  }

  /**
   * Find all items used outside the gallery and initialize custom behavior.
   * @private
   */
  function initItemsWithoutGallery_() {
    // Apply settings to each item
    var items = document.querySelectorAll('.' + elementClass_.item);
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      initItemDisplay_(item);
    }
  }

  /**
   * Set the display settings for each item.
   * Add any custom functionality you need applied on load.
   * @param {Element} item Item element.
   * @private
   */
  function initItemDisplay_(item) {

    // if you're using sales prices.
    setSalePricesDisplay_(item);

    // Set mouseout.
    itemMouseOut(item);
  }

  /**
   * Sets the 3 price elements to display correctly when using sales price.
   * Find your price elements and set into common functionality.
   * @param {Element} item Item element.
   * @private
   */
  function setSalePricesDisplay_(item) {
    // Get reference to each price element.
    var itemPrice = item.querySelector('.' + elementClass_.itemPrice);
    var itemSalePrice = item.querySelector('.' + elementClass_.itemSalePrice);
    var itemRegularPrice = item.querySelector('.' + elementClass_.itemRegularPrice);

    // Sets each item to display correct prices.
    common.displayCorrectPrices(itemPrice, itemSalePrice, itemRegularPrice);
  }

  /**
   * Custom Item Mouse Interactions. Add your own behavior.
   */

  /**
   * Custom Mouseover interaction functionality.
   * @param {Element} item
   */
  function itemMouseOver(item) {
    stopAutoCycle();
    itemHighlight(item);
  }

  /**
   * Custom Mouseout interaction functionality.
   * @param {Element} item
   */
  function itemMouseOut(item) {
    itemUnHighlight(item);
  }

  return {
    init: init,
    itemMouseOver: itemMouseOver,
    itemMouseOut: itemMouseOut,
    transformDynamicData:transformDynamicData
  };

})();
