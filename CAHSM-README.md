# CHASM (Case Harvesting, Analysis, and Signaling Machine)

## Business Overview

CHASM (Case Harvesting, Analysis, and Signaling Machine) is a standalone system designed to extract, process, and classify foreclosure case data from Florida county court systems for investment analysis. This system replaces a costly third-party API (UniCourt) with direct access to county court data, significantly reducing operational costs while improving data quality and update frequency control.

### Problem Statement

Foreclosure investment companies need timely, accurate data from county court systems to identify potential investment opportunities. Previously, this was accomplished using expensive third-party API services with limited control over data freshness and completeness. Additionally, the manual classification of cases into investment scenarios was time-consuming and inconsistent.

### Solution

This system solves these problems by:

1. **Direct Data Access**: Bypassing third-party services by connecting directly to county court systems
2. **Cost Reduction**: Eliminating recurring API costs through owned infrastructure
3. **Improved Data Quality**: Enhancing data extraction with LLM processing
4. **Investment Classification**: Automatically categorizing cases into specific investment scenarios
5. **Real-time Updates**: Providing configurable update schedules for time-sensitive cases
6. **Seamless Integration**: Connecting with Odoo CRM through a secure, well-documented API

### Key Business Benefits

- **Reduced Operational Costs**: Eliminates expensive third-party API subscription fees
- **Faster Decision Making**: Real-time data enables quicker investment decisions
- **Improved Opportunity Identification**: Automated classification highlights the most promising cases
- **Enhanced Data Control**: Greater control over data quality and update frequency
- **Scalable Architecture**: System designed to handle growing data volumes and county coverage

## Technical Overview

The system implements a distributed, fault-tolerant architecture that directly interfaces with 13 Florida county court systems using a combination of discovered unofficial APIs and web scraping techniques.

### Architecture Components

1. **Multi-County Data Access Layer**:
   - Direct API integration for 8 counties (Miami-Dade, Broward, Palm Beach, Hillsborough, Orange, Pinellas, Polk, Duval)
   - Browser-based scrapers for 5 counties (Brevard, Pasco, Flagler, St. Lucie, Volusia)
   - Factory pattern to select appropriate access method per county

2. **Document Processing Pipeline**:
   - OCR processing with multiple engines (Tesseract, Google Vision, Azure OCR, Amazon Textract)
   - Document quality assessment and enhancement
   - Visual Character Recognition (VCR) for complex documents

3. **LLM Integration**:
   - Text extraction and classification of court documents
   - Customizable key element identification
   - Dynamic prompt generation

4. **Workflow Orchestration**:
   - Prefect-based workflow management
   - Scheduled data collection and updates
   - Error handling and retry mechanisms

5. **API Service**:
   - Secure REST API with authentication
   - Rate limiting and circuit breakers
   - Webhook notifications for real-time updates

6. **Admin Dashboard**:
   - Real-time monitoring
   - Performance metrics
   - User management and access control

### Investment Classification System

The system automatically categorizes foreclosure cases into three primary investment scenarios:

1. **Lien Deal**: Cases where:
   - Plaintiff is a Homeowners Association (HOA)
   - No opposition from homeowner has been filed

2. **Cash-for-Keys Deal**: Cases where:
   - Property is owner-occupied
   - Homeowner has not hired an attorney
   - Homeowner has not filed a pro-se response

3. **Cash-for-Keys Friendly**: Cases meeting Cash-for-Keys criteria in:
   - Miami-Dade County
   - Broward County
   - Palm Beach County

### Custom Key Element Management

The system includes a feature for users to define custom key elements for the LLM to identify in court documents, enabling domain-specific analysis without code changes.

### Security Features

- Secure credential management with AWS Secrets Manager
- Token-based authentication for API access
- Rate limiting to prevent abuse
- Role-based access control
- Comprehensive logging and monitoring

## System Overview Diagram

```
                            ┌───────────────────────────────────────────────┐
                            │                                               │
┌───────────────┐           │               COURT DATA ACCESS               │
│               │           │  ┌─────────────────┐      ┌───────────────┐   │
│  Florida      │           │  │ API Clients     │      │ Web Scrapers  │   │
│  County       │◄─────────►│  │ (8 Counties)    │      │ (5 Counties)  │   │
│  Court        │           │  └────────┬────────┘      └───────┬───────┘   │
│  Systems      │           │           │                       │           │
│               │           │           └───────────┬───────────┘           │
└───────────────┘           │                       │                       │
                            │                       ▼                       │
                            │           ┌─────────────────────┐             │
                            │           │  Document Storage   │             │
                            │           │  (Raw Data)         │             │
                            │           └──────────┬──────────┘             │
                            │                      │                        │
                            │                      ▼                        │
                            │           ┌─────────────────────┐             │
                            │           │  Document Processing│             │
                            │           │  (OCR + LLM)        │             │
                            │           └──────────┬──────────┘             │
                            │                      │                        │
                            │                      ▼                        │
                            │           ┌─────────────────────┐             │
                            │           │  Case Classification│             │
                            │           │  (Investment Types) │             │
                            │           └──────────┬──────────┘             │
                            │                      │                        │
┌───────────────┐           │                      ▼                        │
│               │           │           ┌─────────────────────┐             │
│   Odoo CRM    │◄─────────►│           │     API Service     │             │
│               │           │           └─────────────────────┘             │
└───────────────┘           │                                               │
                            │                      ▲                        │
                            │                      │                        │
                            │           ┌─────────────────────┐             │
                            │           │  Admin Dashboard    │             │
                            │           │  Monitoring         │             │
                            │           └─────────────────────┘             │
                            │                                               │
                            └───────────────────────────────────────────────┘
                               FLORIDA CLERK OF COURTS CASE DOCKET SYSTEM
```

## Integration with Odoo CRM

The system connects with Odoo CRM through a secure RESTful API, providing:

1. **Case Data Retrieval**: Odoo can request detailed information about specific foreclosure cases
2. **Real-time Updates**: System pushes updates to Odoo via webhooks when case status changes
3. **Investment Classification**: Odoo receives pre-classified investment opportunities
4. **Document Access**: System provides access to court documents through secure S3 URLs
5. **Batch Processing**: Odoo can request updates for multiple cases in a single operation

## Development and Deployment

The system is containerized using Docker for consistent deployment across environments:
- Development
- Testing
- Staging
- Production

A comprehensive CI/CD pipeline is implemented for automated testing and deployment using GitHub Actions. 