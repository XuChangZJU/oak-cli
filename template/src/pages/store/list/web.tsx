import React from 'react';
import {
    Table,
    Tag,
    Button,
    DialogPlugin,
    Space,
    List,
    Image,
    Row,
    Col,
    Input,
} from 'tdesign-react';
import { Icon } from 'tdesign-icons-react';
import Style from './web.module.less';

const { ListItem, ListItemMeta } = List;

export default function render(this: any) {
    const { t } = this;
    const { width } = this.props;
    const { pagination, stores = [], oakLoading, searchValue } = this.state;
    const { pageSize, total, currentPage } = pagination || {};

    return (
        <div className={Style.mobileContainer}>
            <List>
                {stores?.length ? (
                    stores.map((store: any) => (
                        <div
                            key={store.id}
                            onClick={() => {
                                this.goDetailById(store.id);
                            }}
                        >
                            <ListItem>
                                <ListItemMeta
                                    image={
                                        <Image
                                            src={store.coverPicture}
                                            fit="contain"
                                            style={{ width: 60, height: 60 }}
                                        ></Image>
                                    }
                                    title={store.name}
                                    description={store.introduction}
                                />
                            </ListItem>
                        </div>
                    ))
                ) : (
                    <div>
                        <span>暂无数据</span>
                        <Button
                            size="medium"
                            theme="primary"
                            onClick={() => {
                                this.goUpsert();
                            }}
                        >
                            {t('action.add')}
                        </Button>
                    </div>
                )}
            </List>
            <Button
                shape="circle"
                size="medium"
                theme="primary"
                onClick={() => {
                    this.goUpsert();
                }}
                icon={<Icon name="add" />}
                style={{
                    position: 'fixed',
                    bottom: 32,
                    right: 16,
                }}
            />
        </div>
    );
}
