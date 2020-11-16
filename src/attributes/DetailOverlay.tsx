import React from "react";
import { Overlay, Popover } from "react-bootstrap";
import { ComponentEx, tooltip } from "vortex-api";
import { TFunction } from "vortex-api/lib/types/api";
import { I18N_NAMESPACE } from "..";

interface IDetailProps {
    items: string[];
    title: string;
    direction?: 'left'|'top'|'right'|'bottom';
    t: TFunction;
    ns?: string;
    center?: boolean;
}

interface IComponentState {
    open: boolean;
}

class DetailOverlay extends ComponentEx<IDetailProps, IComponentState> {
    private mRef: Element;
    constructor(props: IDetailProps) {
        super(props);

        this.state = {
            open: false,
        };
    }

    public render() {
        const { items, t, title, center } = this.props;
        const IconX: any = tooltip.Icon;
        var content: JSX.Element | JSX.Element[];
        var direction = this.props.direction ?? 'left';
        if (items.length == 0) {
            return <div></div>
            // content = <div></div>
        } else {
            const popover = (
                <Popover id='popover-acev-paks'>
                    <div style={{ maxHeight: 700, overflowY: 'auto' }}>
                        <p>
                            <strong>{t(title)}:</strong>
                        </p>
                        <ul>{items.map(p => <li>{p}</li>)}</ul>
                    </div>
                </Popover>
            );
            content = (
                <>
                    <Overlay
                        rootClose
                        placement={direction}
                        onHide={this.hide}
                        show={this.state.open}
                        target={this.getRef}
                    >
                        {popover}
                    </Overlay>
                    <div ref={this.setRef} onClick={this.toggle} className={`av-attribute-icons ${center ? 'av-attribute-center' : ''}`}>
                        {this.props.children}
                    </div>
                </>
            );
        }
        return content;
    }

    private getRef = () => this.mRef;

    private setRef = (ref: Element) => {
        this.mRef = ref;
    }

    private hide = () => {
        this.setState({ open: false });
    }

    private toggle = () => {
        this.setState({ open: !this.state.open });
    }
}

export default DetailOverlay;