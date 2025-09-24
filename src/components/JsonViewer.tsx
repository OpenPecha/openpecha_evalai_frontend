import JsonView from 'react18-json-view'

const JsonViewer = ({ json }: { json: any }) => {
    return <JsonView src={json} enableClipboard={false} />
}

export default JsonViewer;