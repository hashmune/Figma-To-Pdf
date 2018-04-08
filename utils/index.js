const axios = require('axios')
const {performance}  = require('perf_hooks')
const fs = require('fs')
const blobStream = require('blob-stream');
const PDFDocument  = require('pdfkit')
const SVGtoPDF = require('svg-to-pdfkit');

const ACCESS_TOKEN = "<YOUR ACCESS TOKEN>"


let axiosInstance = axios.create({
    baseURL : "https://api.figma.com/v1/",
    headers : {
        "X-Figma-Token" : ACCESS_TOKEN
    }
})

const pdfCreator = {
    async getFilePages(key) {
        let start = performance.now()
        let response = await axiosInstance.get(`files/${key}`)
        let end = performance.now()
        
        console.log(`Got file pages in ${end - start} ms`)

        console.log(response.data.document.children[0])

        return response.data.document.children[0].children
            .filter(layer => layer.type === "FRAME")
            .sort((a,b) => parseInt(a.name) - parseInt(b.name))
    },
    async exportPages(pages,key) {
        let start = performance.now()
        let pagesPromises = []
        
        for(let page of pages) {
            let pagePromise = this.exportPage(page,key)
            pagesPromises.push(pagePromise)
        }
        await Promise.all(pagesPromises)
        let end = performance.now()
        
        console.log(`Exported pages in ${end - start} ms `)

        return "ok"
    },
    async exportPage(page,key) {
        let response = await axiosInstance.get(`images/${key}`,{
            params : {
                ids : page.id,
                format : "svg"
            }
        })

        page.imageUrl = Object.values(response.data.images)[0]

        return "exported"
    },
    async getImagesContent(pages) {
        let start = performance.now()
        let imagesPromises = []
        for(let page of pages ) {
            let imagePromise = this.getImageContent(page)
            imagesPromises.push(imagePromise)
        }
        await Promise.all(imagesPromises) 
        let end = performance.now()
        console.log(`Got images content in ${end - start} ms `)
        return "ok"
    },
    async getImageContent(page) {
        let response = await axios.get(page.imageUrl)
        page.svgContent = response.data
        return "content"
    },
    async createPdf(pages,res) {
        let doc = new PDFDocument({compress: false,size : [pages[0].absoluteBoundingBox.width * 0.75,pages[0].absoluteBoundingBox.height* 0.75]})
        let stream = doc.pipe(res);
        SVGtoPDF(doc, pages[0].svgContent , 0, 0);
        pages.shift()
        for(let page of pages) {
            doc.addPage({size : [page.absoluteBoundingBox.width* 0.75,page.absoluteBoundingBox.height* 0.75]})
            SVGtoPDF(doc, page.svgContent , 0, 0);
        }

    
        doc.end();
    }
}
<<<<<<< HEAD

module.exports = pdfCreator
=======
>>>>>>> 5c00259147792eff5514b901f2459019465bec7d
