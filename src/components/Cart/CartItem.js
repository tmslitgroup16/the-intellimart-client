import React from 'react';

function CartItem({ item, removeFromCart, updateQuantity }) {
  const handleQuantityChange = (event) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemoveFromCart = (product) => {
    if(product.quantity>1)
      updateQuantity(product.id, product.quantity-1);
    else
      removeFromCart(product.id);
  }

  return (
    <div className="cart-item border p-4 mb-4 flex">
      <div className="cart-details flex-1 text-center">
        <h1 className="mb-4 text-lg font-semibold">{item.name}</h1>

        {updateQuantity && (
          <div className="set_quantity flex items-center justify-center space-x-2 mb-2">
            <button
              //onClick={() => updateQuantity(item.id, item.quantity - 1)}
              onClick={() => handleRemoveFromCart(item)}
              className="px-2 py-1 bg-gray-300 rounded"
            >
              -
            </button>
            <input
              type="text"
              name=""
              value={item.quantity}
              onChange={handleQuantityChange}
              className="w-8 text-center"
            />
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-2 py-1 bg-gray-300 rounded"
            >
              +
            </button>
          </div>
        )}

        <div className="remove_wish">
          <button
            onClick={() => removeFromCart(item.id)}
            className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-4 py-1 rounded-full hover:bg-gradient-to-r hover:from-teal-600 hover:to-teal-800"
          >
            Remove Item
          </button>
        </div>

        <div className="price_money mb-2">
          <h3 className="text-xl font-semibold">₹{(item.price * item.quantity).toFixed(2)}</h3>
          <h3 className="text-xl font-semibold">[{item.location}]</h3>
        </div>

        <div className="scan_info mb-2">
        {item.isScanned ? (
          <h3 className="text-xl font-semibold text-green-500">Scanned!</h3>
        ) : (
          <h3 className="text-xl font-semibold text-red-500">Not Scanned Yet!</h3>
        )}
      </div>

      </div>


      <div className="cart-image ml-4">
        <img src={item.url} alt="cart img" className="w-24 h-24 object-cover" />
      </div>
    </div>
  );
}

export default CartItem;
