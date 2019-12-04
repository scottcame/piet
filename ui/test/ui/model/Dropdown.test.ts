import { DropdownModel } from "../../../src/js/ui/model/Dropdown";
import { List } from "../../../src/js/collections/List";
import { TestObservableChangeEventListener } from "../../util/TestObservableChangeEventListener";
import { Editable, EditEventListener, PropertyEditEvent } from "../../../src/js/model/Persistence";

class TestObject implements Editable {
  private _value: string;
  private editEventListeners: EditEventListener[];
  dirty: boolean;
  constructor(value: string) {
    this._value = value;
    this.editEventListeners = [];
  }
  set value(value: string) {
    this._value = value;
    this.editEventListeners.forEach((listener: EditEventListener) => {
      listener.notifyPropertyEdit(new PropertyEditEvent(this, "value"));
    });
  }
  get value(): string {
    return this._value;
  }
  cancelEdits(): void {
    throw new Error("Method not implemented.");
  }
  checkpointEdits(): void {
    throw new Error("Method not implemented.");
  }
  addEditEventListener(listener: EditEventListener): EditEventListener {
    this.editEventListeners.push(listener);
    return listener;
  }
  removeEditEventListener(listener: EditEventListener): EditEventListener {
    let ret: EditEventListener = null;
    this.editEventListeners.forEach((thisListener: EditEventListener, index: number): boolean => {
      if (listener == thisListener) {
        this.editEventListeners.splice(index, 1);
        ret = thisListener;
        return true;
      }
      return false;
    });
    return ret;
  }
}

let dropdownModel: DropdownModel<TestObject>;
let items: List<TestObject>;

beforeEach(() => {
  items = new List();
  dropdownModel = new DropdownModel(items, "value");
});

test('empty model', () => {
  expect(dropdownModel.getItemAt(0)).toBeFalsy();
  expect(dropdownModel.selectedIndex).not.toBeNull();
  expect(dropdownModel.selectedIndex.value).toBeNull();
  expect(dropdownModel.selectedItem).toBeNull();
  expect(() => { dropdownModel.removeSelectedItem(); }).not.toThrow();
});

test('add item', async () => {
  const item1 = new TestObject('item1');
  await items.add(item1);
  expect(dropdownModel.selectedIndex).not.toBeNull();
  expect(dropdownModel.selectedIndex.value).toBe(0);
  expect(dropdownModel.selectedItem).not.toBeNull();
  expect(dropdownModel.getItemAt(0)).not.toBeFalsy();
  expect(dropdownModel.getItemAt(0).value).toBe('item1');
  dropdownModel.selectedIndex.value = 0;
  expect(dropdownModel.selectedIndex.value).not.toBeNull();
  expect(dropdownModel.selectedItem).not.toBeNull();
});

test('remove item', async () => {
  const item1 = new TestObject('item1');
  const item2 = new TestObject('item2');
  await Promise.all([items.add(item1), items.add(item2)]);
  expect(items).toHaveLength(2);
  dropdownModel.selectedIndex.value = 0;
  await dropdownModel.removeSelectedItem().then(async () => {
    expect(items).toHaveLength(1);
    expect(dropdownModel.selectedIndex.value).toBe(0);
    dropdownModel.selectedIndex.value = 0;
    expect(dropdownModel.selectedItem.value).toBe('item2');
    await dropdownModel.removeSelectedItem();
    expect(items).toHaveLength(0);
    expect(dropdownModel.selectedIndex.value).toBeNull();
  });
});

test('dropdown label', async () => {
  const item1 = new TestObject('item1');
  const testListener = new TestObservableChangeEventListener();
  dropdownModel.label.addChangeEventListener(testListener);
  expect(dropdownModel.label).not.toBeNull();
  expect(dropdownModel.label.value).toBeNull();
  await items.add(item1);
  expect(dropdownModel.label.value).toBe('item1');
  // called twice...once for the add, once for the selection after the add
  expect(testListener.f).toHaveBeenCalledTimes(2);
  expect(testListener.event.newValue).toBe("item1");
});

test('dropdown selection on list mod', async () => {
  expect(dropdownModel.selectedIndex.value).toBeNull();
  await items.add(new TestObject('item1'));
  expect(dropdownModel.selectedIndex.value).toBe(0);
  await items.add(new TestObject('item2')).then(async () => {
    expect(dropdownModel.selectedIndex.value).toBe(1);
    dropdownModel.selectedIndex.value = 0;
    expect(dropdownModel.selectedIndex.value).toBe(0);
    await items.add(new TestObject('item3'));
    expect(dropdownModel.selectedIndex.value).toBe(2);
    await items.add(new TestObject('item4'));
    expect(dropdownModel.selectedIndex.value).toBe(3);
    await items.removeAt(3);
    expect(dropdownModel.selectedIndex.value).toBe(2);
    await items.add(new TestObject('item4')).then(async () => {
      expect(dropdownModel.selectedIndex.value).toBe(3);
      dropdownModel.selectedIndex.value = 2;
      await items.removeAt(2);
      expect(dropdownModel.selectedIndex.value).toBe(2);
      await items.removeAt(0);
      expect(dropdownModel.selectedIndex.value).toBe(1);
      await items.clear();
      expect(dropdownModel.selectedIndex.value).toBeNull();
      await items.add(new TestObject('item1'));
      expect(dropdownModel.selectedIndex.value).toBe(0);
      await items.add(new TestObject('item2')).then(async () => {
        expect(dropdownModel.selectedIndex.value).toBe(1);
        dropdownModel.selectedIndex.value = 0;
        await items.removeAt(0);
        expect(dropdownModel.selectedIndex.value).toBe(0);
        });
    });
  });
});
