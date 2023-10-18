import { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function TableRow({productId, name, stock}) {
  const [intStock, setStock] = useState(stock);

  const updateStock = () => {
    axios({
      url: `/api/stock/${productId}`,
      method: 'PUT',
      data: {
        Stock: intStock,
      },
    }).catch(console.dir);
  };

  return (
    <tr>
      <td>{name}</td>
      <td>
        <input
          type='text'
          value={intStock}
          onChange={e => setStock(e.target.value)}
        />
      </td>
      <td>
        <button onClick={updateStock}>
          Update
        </button>
      </td>
    </tr>
  );
}

export default function EditStock() {
  const [arrProducts, setProducts] = useState([]);

  useEffect(() => {
    axios({
      url: '/api/stock',
      method: 'GET',
    })
      .then(({ data }) => {
        console.log('data is', data);
        setProducts(data);
      })
      .catch(console.dir);
  }, []);

  return (
    <div className='page-container'>
      <div
        style={{
          display: 'flex',
          gap: '20px'
        }}
      >
        <Link to='/editcommissionoptions'>Go To Commission Options</Link>
        <Link to='/editwork'>Go To Gallery Options</Link>
      </div>
      <div className='container-image-list'>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(arrProducts) && arrProducts.map(productInfo =>
              <Fragment key={productInfo.ProductId}>
                <TableRow
                  productId={productInfo.ProductId}
                  name={productInfo.Name}
                  stock={productInfo.Stock}
                />
              </Fragment>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
