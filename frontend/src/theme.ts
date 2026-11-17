import { createTheme } from "@mantine/core";

export const theme = createTheme({
    colors: {
        beam: ['#fff3ea', '#ffe2cc', '#fdc49a', '#faa062', '#f27c2e', '#de5f18', '#c2410c', '#a5360a', '#892d0a', '#6e2408'],
        rack: ['#eaf1f8', '#d3e1f0', '#a9c3e1', '#7da3cf', '#5686bd', '#386ba6', '#2a5589', '#1f4370', '#17335a', '#102545'],
    },
    primaryColor: 'beam',
    primaryShade: 6,
    fontFamily: "'Barlow', system-ui, -apple-system, 'Segoe UI', sans-serif",
    headings: {
        fontFamily: "'Barlow Semi Condensed', 'Barlow', system-ui, sans-serif",
        fontWeight: '600',
        sizes: {
            h1: { fontSize: '1.75rem', lineHeight: '1.2' },
            h2: { fontSize: '1.25rem', lineHeight: '1.3' },
            h3: { fontSize: '1.125rem', lineHeight: '1.3' },
            h4: { fontSize: '1rem', lineHeight: '1.4' },
        },
    },
    defaultRadius: 'sm',
    cursorType: 'pointer',
    components: {
        Button: { defaultProps: { fw: 600 } },
        Table: { defaultProps: { verticalSpacing: 'sm', horizontalSpacing: 'md', withRowBorders: true } },
        Select: { defaultProps: { allowDeselect: false, nothingFoundMessage: 'Nincs találat' } },
    },
});
