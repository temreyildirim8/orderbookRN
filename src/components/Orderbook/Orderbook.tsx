import React, { useState, useEffect, useRef } from 'react';
import { Centrifuge } from 'centrifuge';
import './Orderbook.css';

interface Order {
  price: number;
  size: number;
}

interface OrderBook {
  bids: Order[];
  asks: Order[];
}

const Orderbook: React.FC = () => {
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const centrifuge = useRef<Centrifuge | null>(null);
  const sequenceRef = useRef<number | null>(null);

  useEffect(() => {
    const connectCentrifuge = () => {
      centrifuge.current = new Centrifuge('wss://api.prod.rabbitx.io/ws', {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MDAwMDAwMDAwIiwiZXhwIjo2NTQ4NDg3NTY5fQ.o_qBZltZdDHBH3zHPQkcRhVBQCtejIuyq8V1yj5kYq8',
      });

      centrifuge.current.on('connect', () => {
        console.log('Connected to the WebSocket');
      });

      centrifuge.current.on('disconnect', (context: any) => {
        console.log('Disconnected', context);
        setTimeout(() => {
          connectCentrifuge(); // Reconnect after a delay
        }, 3000);
      });

      const sub = centrifuge.current.newSubscription('orderbook');

      sub.on('publication', (message: any) => {
        console.log('Received message:', message); // Log received message
        const { data } = message;
        if (sequenceRef.current === null || data.sequence === sequenceRef.current + 1) {
          sequenceRef.current = data.sequence;
          updateOrderBook(data);
        } else {
          console.error('Sequence number mismatch');
          // Implement logic to handle lost packages here
        }
      });

      sub.on('subscribed', () => {
        console.log('Subscribed to orderbook');
      });

      sub.subscribe();

      centrifuge.current.connect();
    };

    connectCentrifuge();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOrderBook = (data: any) => {
    const { bids, asks } = data;
    setOrderBook((prev) => ({
      bids: mergeOrders(prev.bids, bids),
      asks: mergeOrders(prev.asks, asks),
    }));
  };

  const mergeOrders = (existingOrders: Order[], newOrders: Order[]): Order[] => {
    const orderMap = new Map<number, Order>();
    existingOrders.forEach((order) => orderMap.set(order.price, order));
    newOrders.forEach((order) => orderMap.set(order.price, order));

    const mergedOrders = Array.from(orderMap.values());
    mergedOrders.sort((a, b) => a.price - b.price);
    return mergedOrders;
  };

  return (
    <div className="orderbook">
      <div className="header">
        <div>Price (USD)</div>
        <div>Amount (BTC)</div>
        <div>Total (BTC)</div>
      </div>
      <div className="content">
        <div className="asks">
          {orderBook.asks.map((order, index) => (
            <div className="order" key={index}>
              <div>{order.price.toFixed(2)}</div>
              <div>{order.size.toFixed(4)}</div>
              <div>{(order.price * order.size).toFixed(4)}</div>
            </div>
          ))}
        </div>
        <div className="bids">
          {orderBook.bids.map((order, index) => (
            <div className="order" key={index}>
              <div>{order.price.toFixed(2)}</div>
              <div>{order.size.toFixed(4)}</div>
              <div>{(order.price * order.size).toFixed(4)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orderbook;
