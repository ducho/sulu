/* eslint-disable flowtype/require-valid-file-annotation */
import 'url-search-params-polyfill';
import {when, observable} from 'mobx';
import DatagridStore from '../../stores/DatagridStore';
import metadataStore from '../../stores/MetadataStore';
import ResourceRequester from '../../../../services/ResourceRequester';

jest.mock('../../../../services/ResourceRequester', () => ({
    getList: jest.fn(),
}));

jest.mock('../../stores/MetadataStore', () => ({
    getFields: jest.fn(),
}));

test('Do not send request without defined page parameter', () => {
    const page = observable();
    new DatagridStore('tests', {
        page,
    });
    expect(ResourceRequester.getList).not.toBeCalled();
});

test('Send request with default parameters', (done) => {
    const Promise = require.requireActual('promise');
    ResourceRequester.getList.mockReturnValue(Promise.resolve({
        pages: 3,
        _embedded: {
            tests: [{id: 1}],
        },
    }));
    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    page.set(1);
    expect(ResourceRequester.getList).toBeCalledWith('tests', {page: 1});
    when(
        () => !datagridStore.loading,
        () => {
            expect(datagridStore.data.toJS()).toEqual([{id: 1}]);
            expect(datagridStore.pageCount).toEqual(3);
            datagridStore.destroy();
            done();
        }
    );
});

test('Send request to other base URL', () => {
    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    page.set(1);
    expect(ResourceRequester.getList).toBeCalledWith('tests', {page: 1});
    datagridStore.destroy();
});

test('Send request to other page', () => {
    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    page.set(1);
    expect(ResourceRequester.getList).toBeCalledWith('tests', {page: 1});
    page.set(2);
    expect(ResourceRequester.getList).toBeCalledWith('tests', {page: 2});
    datagridStore.destroy();
});

test('Send request to other locale', () => {
    const page = observable();
    const locale = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
        locale,
    });
    page.set(1);
    locale.set('en');
    expect(ResourceRequester.getList).toBeCalledWith('tests', {page: 1, locale: 'en'});
    locale.set('de');
    expect(ResourceRequester.getList).toBeCalledWith('tests', {page: 1, locale: 'de'});
    datagridStore.destroy();
});

test('Send not request without locale if undefined', () => {
    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    page.set(1);
    expect(ResourceRequester.getList).toBeCalledWith('tests', {page: 1});
    expect(ResourceRequester.getList.mock.calls[0][1]).not.toHaveProperty('locale');
    expect(ResourceRequester.getList).toBeCalledWith('tests', {page: 1});
    datagridStore.destroy();
});

test('Set loading flag to true before request', () => {
    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    page.set(1);
    datagridStore.setLoading(false);
    datagridStore.sendRequest();
    expect(datagridStore.loading).toEqual(true);
    datagridStore.destroy();
});

test('Set loading flag to false after request', () => {
    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    const Promise = require.requireActual('promise');
    ResourceRequester.getList.mockReturnValue(Promise.resolve({
        _embedded: {
            tests: [],
        },
    }));
    datagridStore.sendRequest();
    when(
        () => !datagridStore.loading,
        () => {
            expect(datagridStore.loading).toEqual(false);
            datagridStore.destroy();
        }
    );
});

test('Get fields from MetadataStore for correct resourceKey', () => {
    const fields = {
        test: {},
    };
    metadataStore.getFields.mockReturnValue(fields);

    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    expect(datagridStore.getFields()).toBe(fields);
    expect(metadataStore.getFields).toBeCalledWith('tests');
    datagridStore.destroy();
});

test('After initialization no row should be selected', () => {
    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    expect(datagridStore.selections.length).toBe(0);
    datagridStore.destroy();
});

test('Select an item', () => {
    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    datagridStore.select(1);
    datagridStore.select(2);
    expect(datagridStore.selections.toJS()).toEqual([1, 2]);

    datagridStore.deselect(1);
    expect(datagridStore.selections.toJS()).toEqual([2]);
    datagridStore.destroy();
});

test('Deselect an item that has not been selected yet', () => {
    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    datagridStore.select(1);
    datagridStore.deselect(2);

    expect(datagridStore.selections.toJS()).toEqual([1]);
    datagridStore.destroy();
});

test('Select the entire page', (done) => {
    ResourceRequester.getList.mockReturnValue(Promise.resolve({
        _embedded: {
            tests: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
        },
    }));

    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    datagridStore.selections = [1, 7];
    page.set(1);
    when(
        () => !datagridStore.loading,
        () => {
            datagridStore.selectEntirePage();
            expect(datagridStore.selections.toJS()).toEqual([1, 7, 2, 3]);
            datagridStore.destroy();
            done();
        }
    );
});

test('Deselect the entire page', (done) => {
    ResourceRequester.getList.mockReturnValue(Promise.resolve({
        _embedded: {
            tests: [
                {id: 1},
                {id: 2},
                {id: 3},
            ],
        },
    }));

    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    datagridStore.selections = [1, 2, 7];
    page.set(1);
    when(
        () => !datagridStore.loading,
        () => {
            datagridStore.deselectEntirePage();
            expect(datagridStore.selections.toJS()).toEqual([7]);
            datagridStore.destroy();
            done();
        }
    );
});

test('Clear the selection', () => {
    const page = observable();
    const datagridStore = new DatagridStore('tests', {
        page,
    });
    datagridStore.selections = [1, 4, 5];
    page.set(1);
    expect(datagridStore.selections).toHaveLength(3);

    datagridStore.clearSelection();
    expect(datagridStore.selections).toHaveLength(0);
});
