import * as React from 'react';
import {
    Button,
    Row,
    Col,
    Space,
    Card,
    Image,
    ImageViewer,
    Tag,
} from 'tdesign-react';
import classNames from 'classnames';
import Style from './web.module.less';

export default function render(this: any) {
    const { t } = this;
    const { number, name, price, introduction, author, coverPictures, iState } =
        this.state;
    return (
        <div>
            <Card title="基本信息">
                <Row>
                    <Col xs={12} sm={3}>
                        <div className={Style.label}>
                            {t('book:attr.number')}
                        </div>
                        <div className={Style.value}>{number}</div>
                    </Col>
                    <Col xs={12} sm={3}>
                        <div className={Style.label}>{t('book:attr.name')}</div>
                        <div className={Style.value}>{name}</div>
                    </Col>
                    <Col xs={12} sm={3}>
                        <div className={Style.label}>
                            {t('book:attr.author')}
                        </div>
                        <div className={Style.value}>{author}</div>
                    </Col>
                    <Col xs={12} sm={3}>
                        <div className={Style.label}>
                            {t('book:attr.price')}
                        </div>
                        <div className={Style.value}>{price}</div>
                    </Col>
                    <Col xs={12} sm={3}>
                        <div className={Style.label}>
                            {t('book:attr.iState')}
                        </div>
                        <div>
                            <Tag theme="primary" size="small">
                                {iState && t(`book:v.iState.${iState}`)}
                            </Tag>
                        </div>
                    </Col>
                    <Col xs={12}>
                        <div className={Style.label}>
                            {t('book:attr.introduction')}
                        </div>
                        <div
                            className={classNames(Style.value, Style.valueWrap)}
                        >
                            {introduction}
                        </div>
                    </Col>
                    <Col xs={12}>
                        <div className={Style.label}>
                            {t('book:attr.files')}
                        </div>
                        <div style={{ display: 'flex' }}>
                            {coverPictures?.map(
                                (img: string, index: number) => {
                                    const trigger = (props: {
                                        onOpen: React.MouseEventHandler;
                                    }) => {
                                        const { onOpen } = props;
                                        return (
                                            <div onClick={onOpen}>
                                                <Image
                                                    key={index}
                                                    src={img}
                                                    fit="contain"
                                                    style={{
                                                        height: 100,
                                                        width: 100,
                                                    }}
                                                />
                                            </div>
                                        );
                                    };

                                    return (
                                        <ImageViewer
                                            key={img}
                                            trigger={trigger as any}
                                            images={coverPictures}
                                            defaultIndex={index}
                                        />
                                    );
                                }
                            )}
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}