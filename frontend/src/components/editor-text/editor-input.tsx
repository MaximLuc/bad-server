import {
    ContentEditableEvent,
    createButton,
    Editor,
    EditorProvider,
    Toolbar,
} from 'react-simple-wysiwyg'
import './editor-input.scss'

type EditorInputProps = {
    value: string
    onChange: (value: string) => void
}

  function getSafeUrl(url: string | null) {
      if (!url) {
          return undefined
      }

      try {
          const parsedUrl = new URL(url, window.location.origin)
          const allowedProtocols = ['http:', 'https:', 'mailto:']

          return allowedProtocols.includes(parsedUrl.protocol) ? url : undefined
      } catch {
          return undefined
      }
  }

export default function EditorInput({ onChange, value }: EditorInputProps) {
    function handleChangeElement(e: ContentEditableEvent) {
        onChange(e.target.value)
    }

    const BtnLinkCustom = createButton(
        'Вставить ссылку',
        '🔗',
        ({ $selection }) => {
            if ($selection?.nodeName === 'A') {
                document.execCommand('unlink')
            } else {
                 
                const safeUrl = getSafeUrl(prompt('URL', ''))
                if (safeUrl) {
                    document.execCommand('createLink', false, safeUrl)
                }
            }
        }
    )

    return (
        <div className='customEditor'>
            <EditorProvider>
                <Editor value={value} onChange={handleChangeElement}>
                    <Toolbar>
                        <span className='rsw-link-title'>
                            Вставить ссылку <BtnLinkCustom />
                        </span>
                    </Toolbar>
                </Editor>
            </EditorProvider>
        </div>
    )
}
