import { DropdownItem, DropdownModel } from "../../../src/js/ui/model/Dropdown";
import { Observable } from "../../../src/js/util/Observable";
import { List } from "../../../src/js/collections/List";
import { TestObservableChangeEventListener } from "../../util/TestObservableChangeEventListener";

class TestDropdownItem implements DropdownItem {
  private _value: Observable<string>;
  constructor(value: string) {
    this._value = new Observable();
    this._value.value = value;
  }
  set value(value: string) {
    this._value.value = value;
  }
  get value(): string {
    return this._value.value;
  }
  getLabel(): Observable<string> {
    return this._value;
  }
  getValue(): string {
    return this._value.value;
  }
}

let dropdownModel: DropdownModel;
let items: List<TestDropdownItem>;

beforeEach(() => {
  items = new List();
  dropdownModel = new DropdownModel(items);
});

test('empty model', () => {
  expect(dropdownModel.getItemAt(0)).toBeFalsy();
  expect(dropdownModel.selectedIndex).not.toBeNull();
  expect(dropdownModel.selectedIndex.value).toBeNull();
  expect(dropdownModel.selectedItem).toBeNull();
  expect(() => { dropdownModel.removeSelectedItem(); }).not.toThrow();
});

test('add item', () => {
  const item1 = new TestDropdownItem('item1');
  items.add(item1);
  expect(dropdownModel.selectedIndex.value).toBeNull();
  expect(dropdownModel.selectedItem).toBeNull();
  expect(dropdownModel.getItemAt(0)).not.toBeFalsy();
  expect((dropdownModel.getItemAt(0) as TestDropdownItem).value).toBe('item1');
  expect(dropdownModel.getItemAt(0).getLabel().value).toBe("item1");
  dropdownModel.selectedIndex.value = 0;
  expect(dropdownModel.selectedIndex.value).not.toBeNull();
  expect(dropdownModel.selectedItem).not.toBeNull();
  expect(dropdownModel.selectedItem.getLabel().value).toBe("item1");
});

test('label observation', () => {
  const testListener = new TestObservableChangeEventListener();
  const item1 = new TestDropdownItem('item1');
  item1.getLabel().addChangeEventListener(testListener);
  items.add(item1);
  dropdownModel.selectedIndex.value = 0;
  expect(dropdownModel.selectedItem.getLabel().value).toBe("item1");
  item1.value = "updated item1";
  expect(dropdownModel.selectedItem.getLabel().value).toBe("updated item1");
  expect(testListener.f).toHaveBeenCalledTimes(1);
  expect(testListener.event.newValue).toBe("updated item1");
  expect(testListener.event.oldValue).toBe("item1");
});

test('remove item', () => {
  const item1 = new TestDropdownItem('item1');
  const item2 = new TestDropdownItem('item2');
  items.add(item1);
  items.add(item2);
  expect(items).toHaveLength(2);
  dropdownModel.selectedIndex.value = 0;
  dropdownModel.removeSelectedItem();
  expect(items).toHaveLength(1);
  expect(dropdownModel.selectedIndex.value).toBeNull();
  dropdownModel.selectedIndex.value = 0;
  expect(dropdownModel.selectedItem.getValue()).toBe('item2');
  dropdownModel.removeSelectedItem();
  expect(items).toHaveLength(0);
  expect(dropdownModel.selectedIndex.value).toBeNull();
});
