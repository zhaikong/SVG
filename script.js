document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tabs__trigger');
    const tabContents = document.querySelectorAll('.tabs__content');
    const svgInput = document.getElementById('svgInput');
    const svgContainer = document.getElementById('svgContainer');
    const svgFileName = document.getElementById('svgFileName');
    const downloadSvgBtn = document.getElementById('downloadSvgBtn');
    const fileInput = document.getElementById('fileInput');
    const downloadPngBtn = document.getElementById('downloadPngBtn');

    // 选项卡功能
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('tabs__trigger--active'));
            tabContents.forEach(content => content.classList.remove('tabs__content--active'));

            tab.classList.add('tabs__trigger--active');
            document.querySelector(`[data-tab-content="${target}"]`).classList.add('tabs__content--active');

            if (target === 'preview') {
                updatePreview();
            }
        });
    });

    // SVG预览功能
    svgInput.addEventListener('input', updatePreview);

    function updatePreview() {
        const svgCode = svgInput.value.trim();
        if (svgCode) {
            const sanitizedSvgCode = sanitizeSvg(svgCode);
            svgContainer.innerHTML = sanitizedSvgCode;
            downloadPngBtn.disabled = false;
        } else {
            svgContainer.innerHTML = '<p>请在输入框中输入SVG代码</p>';
            downloadPngBtn.disabled = true;
        }
    }

    // 下载SVG功能
    downloadSvgBtn.addEventListener('click', function() {
        const svgCode = svgInput.value.trim();
        if (svgCode) {
            const fileName = svgFileName.value.trim() || 'download';
            downloadSVG(svgCode, fileName + '.svg');
        } else {
            alert('请先输入SVG代码。');
        }
    });

    // 文件上传功能
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type === 'image/svg+xml') {
            const reader = new FileReader();
            reader.onload = function(e) {
                const svgCode = e.target.result;
                const sanitizedSvgCode = sanitizeSvg(svgCode);
                svgInput.value = sanitizedSvgCode;
                updatePreview();
            };
            reader.readAsText(file);
        } else {
            alert('请选择一个有效的SVG文件。');
        }
    });

    // 下载PNG功能
    downloadPngBtn.addEventListener('click', function() {
        const svg = svgContainer.querySelector('svg');
        if (svg) {
            saveSVGasPNG(svg);
        } else {
            alert('请先预览SVG或上传SVG文件。');
        }
    });

    function downloadSVG(svgCode, fileName) {
        const blob = new Blob([svgCode], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    function saveSVGasPNG(svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const scale = 2;
            canvas.width = this.width * scale;
            canvas.height = this.height * scale;
            const ctx = canvas.getContext("2d");
            ctx.scale(scale, scale);
            ctx.drawImage(this, 0, 0);
            URL.revokeObjectURL(svgUrl);

            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'download.png';
                a.click();
                URL.revokeObjectURL(url);
            });
        };

        img.src = svgUrl;
    }

    function sanitizeSvg(svg) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        
        // 移除所有脚本元素
        const scripts = doc.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
            scripts[i].parentNode.removeChild(scripts[i]);
        }
        
        // 移除所有on*事件属性
        const allElements = doc.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
            const attrs = allElements[i].attributes;
            for (let j = attrs.length - 1; j >= 0; j--) {
                if (attrs[j].name.startsWith('on')) {
                    allElements[i].removeAttribute(attrs[j].name);
                }
            }
        }
        
        return new XMLSerializer().serializeToString(doc.documentElement);
    }

    // 初始化预览
    updatePreview();
});