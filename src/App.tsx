import styles from './app.module.scss';
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { mockItems } from './shared/api';
import type { ClientItem, NewItem } from './shared/types';
import { makeClientItemList, generateID } from './shared/utils';
import Wrapper from './Wrapper';
import Header from './Header';
import PageLoader from './PageLoader';
import PageError from './PageError';
import Overview from './Overview';
import NewItemForm from './NewItemForm';
import FilteredItemTable from './FilteredItemTable';

function App() {
  const [clientItems, setClientItems] = useState<ClientItem[]>([]);
  const { isLoading, data } = useQuery('items', mockItems, {
    // Prevent react-query from refetching items from backend and resetting
    // client state, with production API this will not be necessary,
    // we will send POST mutations directly to the backend, although
    // depending on the requirements, we might have to store favorite items
    // as a client state in web storage for example
    staleTime: Number.POSITIVE_INFINITY,
  });
  useEffect(() => {
    if (data && !clientItems.length) {
      setClientItems(makeClientItemList(data.items));
    }
  }, [data]);

  function onItemRemove(id: number) {
    setClientItems(items => items.filter(item => item.id !== id));
  }
  function onItemToggleFavorite(id: number) {
    const updatedItems = [...clientItems];
    const changedItem = updatedItems.find(item => item.id === id)!;
    changedItem.isFavourite = !changedItem.isFavourite;
    setClientItems(updatedItems);
  }
  async function onItemAdd(item: NewItem) {
    // Simulate requesting UUID from backend
    const id = await generateID(clientItems);
    const itemWithID: ClientItem = { ...item, id };
    setClientItems(items => [itemWithID, ...items]);
  }

  if (isLoading) return <PageLoader />;
  if (!data) return <PageError />;

  return (
    <Wrapper>
      <Header />
      <main className={styles.bodyWrapper}>
        <div className={styles.nameOverviewWrapper}>
          <NewItemForm onItemAdd={onItemAdd} />
          <Overview items={clientItems} />
        </div>
        <FilteredItemTable
          items={clientItems}
          onItemRemove={onItemRemove}
          onItemToggleFavorite={onItemToggleFavorite}
        />
      </main>
    </Wrapper>
  );
}

export default App;
